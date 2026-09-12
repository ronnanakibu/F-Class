import fs from 'fs/promises';
import path from 'path';

/**
 * Global In-Memory Cache to preserve data across serverless cold/warm instances
 * during a user's session without crashing on Vercel's read-only file system.
 */
declare global {
  // eslint-disable-next-line no-var
  var __SERVER_STORAGE_CACHE__: Map<string, string> | undefined;
}

if (!global.__SERVER_STORAGE_CACHE__) {
  global.__SERVER_STORAGE_CACHE__ = new Map<string, string>();
}

const memoryCache = global.__SERVER_STORAGE_CACHE__;

/**
 * Reads data file with tiered fallback:
 * 1. In-memory cache (latest session edits)
 * 2. /tmp directory (writable ephemeral disk on serverless)
 * 3. Physical workspace file (process.cwd())
 */
export async function readStorageFile(
  relativePath: string,
  defaultContent: string = '[]'
): Promise<string> {
  const cacheKey = relativePath.replace(/\\/g, '/');

  // Tier 1: In-memory cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // Tier 2: /tmp directory (used on Vercel/serverless)
  const safeFilename = path.basename(relativePath);
  const tmpPath = path.join('/tmp', safeFilename);
  try {
    const tmpContent = await fs.readFile(tmpPath, 'utf-8');
    memoryCache.set(cacheKey, tmpContent);
    return tmpContent;
  } catch {
    // File not in /tmp, continue to project dir
  }

  // Tier 2.5: Cloud Storage (Hugging Face Dataset sync if configured)
  const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  const hfRepo = process.env.HF_DATASET_REPO;
  if (hfRepo) {
    try {
      const hfUrl = `https://huggingface.co/datasets/${hfRepo}/raw/main/${safeFilename}`;
      const res = await fetch(hfUrl, {
        headers: hfToken ? { Authorization: `Bearer ${hfToken}` } : {},
        cache: 'no-store',
      });
      if (res.ok) {
        const cloudContent = await res.text();
        if (cloudContent && cloudContent.trim().length > 0) {
          memoryCache.set(cacheKey, cloudContent);
          return cloudContent;
        }
      }
    } catch {
      // Continue to physical file
    }
  }

  // Tier 3: Physical project file
  const projectPath = path.join(/*turbopackIgnore: true*/ process.cwd(), relativePath);
  try {
    const fileContent = await fs.readFile(projectPath, 'utf-8');
    memoryCache.set(cacheKey, fileContent);
    return fileContent;
  } catch {
    return defaultContent;
  }
}

export interface WriteResult {
  success: boolean;
  isReadOnlyFs: boolean;
  syncedCloud?: boolean;
  message: string;
}

/**
 * Writes data file with serverless safety:
 * 1. Updates in-memory cache instantly
 * 2. Writes to /tmp (writable on Vercel serverless)
 * 3. Tries writing to project disk (works in local dev, gracefully catches EROFS on Vercel)
 * 4. Optional: Syncs to Hugging Face or GitHub if token/repo is configured in environment
 */
export async function writeStorageFile(
  relativePath: string,
  content: string
): Promise<WriteResult> {
  const cacheKey = relativePath.replace(/\\/g, '/');
  
  // 1. In-memory update
  memoryCache.set(cacheKey, content);

  // 2. Write to /tmp (safe on Vercel and Linux serverless)
  const safeFilename = path.basename(relativePath);
  const tmpPath = path.join('/tmp', safeFilename);
  try {
    await fs.writeFile(tmpPath, content, 'utf-8');
  } catch (err) {
    console.warn(`[ServerStorage] /tmp write warning for ${safeFilename}:`, err);
  }

  // 3. Optional Cloud Sync: Hugging Face Dataset
  let syncedCloud = false;
  const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  const hfRepo = process.env.HF_DATASET_REPO; // e.g. "username/class-f-data"

  if (hfToken && hfRepo) {
    try {
      const { uploadFile } = await import('@huggingface/hub');
      await uploadFile({
        repo: { type: 'dataset', name: hfRepo },
        credentials: { accessToken: hfToken },
        file: {
          path: safeFilename,
          content: new Blob([content]),
        },
      });
      syncedCloud = true;
      console.info(`[ServerStorage] Successfully synced ${safeFilename} to Hugging Face Dataset: ${hfRepo}`);
    } catch (e) {
      console.warn('[ServerStorage] Hugging Face sync warning:', e);
    }
  }

  // 4. Try local project disk
  const projectPath = path.join(/*turbopackIgnore: true*/ process.cwd(), relativePath);
  try {
    await fs.writeFile(projectPath, content, 'utf-8');
    return {
      success: true,
      isReadOnlyFs: false,
      syncedCloud,
      message: 'Data berhasil disimpan ke disk!',
    };
  } catch (err: any) {
    // Catch EROFS (read-only file system on Vercel / serverless)
    if (err?.code === 'EROFS' || String(err?.message || '').includes('read-only')) {
      console.info(`[ServerStorage] Read-only filesystem detected on ${safeFilename}. Successfully persisted to memory & /tmp.`);
      return {
        success: true,
        isReadOnlyFs: true,
        syncedCloud,
        message: syncedCloud
          ? 'Data berhasil disimpan ke Sesi Server & Cloud Storage!'
          : 'Data berhasil disimpan di Sesi Server (In-Memory & /tmp). Unduh atau salin berkas JSON jika ingin commit permanen ke Git.',
      };
    }
    throw err;
  }
}
