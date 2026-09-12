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
  const safeFilename = path.basename(relativePath);
  const cacheKey = relativePath.replace(/\\/g, '/');

  // Priority 1: DIRECT TO HUGGING FACE CLOUD DATASET (Primary Source)
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
        if (
          cloudContent &&
          cloudContent.trim().length > 0 &&
          cloudContent.trim() !== '[]' &&
          !cloudContent.includes('404: Not Found')
        ) {
          memoryCache.set(cacheKey, cloudContent);
          return cloudContent;
        }
      } else if (res.status === 404 && hfToken && defaultContent && defaultContent !== '[]') {
        // First-time setup: Auto-seed initial content directly to Hugging Face dataset!
        try {
          const { uploadFile } = await import('@huggingface/hub');
          await uploadFile({
            repo: { type: 'dataset', name: hfRepo },
            credentials: { accessToken: hfToken },
            file: {
              path: safeFilename,
              content: new Blob([defaultContent]),
            },
          });
          console.info(`[ServerStorage] Initialized and seeded ${safeFilename} to Hugging Face Dataset!`);
        } catch (e) {
          console.warn('[ServerStorage] Auto-seed warning:', e);
        }
        memoryCache.set(cacheKey, defaultContent);
        return defaultContent;
      }
    } catch (hfErr) {
      console.warn('[ServerStorage] Hugging Face read failed, falling back to local:', hfErr);
    }
  }

  // Priority 2: In-memory cache (recent session writes)
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    if (cached && cached.trim() !== '[]') return cached;
  }

  // Priority 3: Local project candidate paths (statically scoped to src/data)
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'data', safeFilename),
    path.join(/*turbopackIgnore: true*/ process.cwd(), safeFilename),
  ];

  for (const p of candidatePaths) {
    try {
      const fileContent = await fs.readFile(/*turbopackIgnore: true*/ p, 'utf-8');
      if (fileContent && fileContent.trim().length > 0 && fileContent.trim() !== '[]') {
        memoryCache.set(cacheKey, fileContent);
        return fileContent;
      }
    } catch {
      // Continue to next candidate
    }
  }

  // Priority 4: /tmp ephemeral disk (serverless fallback)
  const tmpPath = path.join('/tmp', safeFilename);
  try {
    const tmpContent = await fs.readFile(tmpPath, 'utf-8');
    if (tmpContent && tmpContent.trim().length > 0 && tmpContent.trim() !== '[]') {
      memoryCache.set(cacheKey, tmpContent);
      return tmpContent;
    }
  } catch {
    // Continue
  }

  // Priority 5: Fallback to bundled default content (Never return empty array)
  if (defaultContent && defaultContent.trim().length > 0) {
    memoryCache.set(cacheKey, defaultContent);
  }
  return defaultContent;
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

  // 4. Try local project disk (only during local development)
  if (process.env.NODE_ENV === 'development') {
    const projectPath = path.join(process.cwd(), 'src', 'data', safeFilename);
    try {
      await fs.writeFile(projectPath, content, 'utf-8');
      return {
        success: true,
        isReadOnlyFs: false,
        syncedCloud,
        message: 'Data berhasil disimpan ke disk lokal!',
      };
    } catch {
      // Continue to cloud return
    }
  }

  return {
    success: true,
    isReadOnlyFs: !syncedCloud,
    syncedCloud,
    message: syncedCloud
      ? 'Data berhasil disimpan langsung ke Hugging Face Cloud!'
      : 'Data disimpan di sesi server (/tmp).',
  };
}
