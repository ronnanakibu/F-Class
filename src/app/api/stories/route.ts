import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';
import { isValidAdminKey } from '@/lib/auth';
import type { IGStory } from '@/types';
import initialStories from '@/data/stories.json';

const RELATIVE_PATH = 'stories.json';
const STORIES_DIR = path.join(process.cwd(), 'public', 'stories');
const DEFAULT_STORIES_JSON = JSON.stringify(initialStories, null, 2);

export const dynamic = 'force-dynamic';

function parseTimestamp(rawDate?: string | number | null): string {
  if (!rawDate) return new Date().toISOString();

  if (typeof rawDate === 'number' || /^\d+$/.test(String(rawDate).trim())) {
    const num = Number(rawDate);
    const ms = num < 10000000000 ? num * 1000 : num;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  const d = new Date(rawDate);
  if (!isNaN(d.getTime())) return d.toISOString();

  return new Date().toISOString();
}

async function getStories(): Promise<IGStory[]> {
  try {
    const raw = await readStorageFile(RELATIVE_PATH, DEFAULT_STORIES_JSON);
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = initialStories;
    }
    if (!Array.isArray(data) || data.length === 0) {
      return initialStories as IGStory[];
    }
    return data;
  } catch {
    return initialStories as IGStory[];
  }
}

async function saveStories(stories: IGStory[]) {
  return writeStorageFile(RELATIVE_PATH, JSON.stringify(stories, null, 2));
}

// GET /api/stories - Return all archived stories sorted newest first
export async function GET() {
  const stories = await getStories();
  const sorted = [...stories].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return NextResponse.json(
    { success: true, stories: sorted },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    }
  );
}

// POST /api/stories - Ingest story from WhatsApp Bot, external script, or Admin
export async function POST(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const contentType = req.headers.get('content-type') || '';

    // 1. Multipart form (media file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const formApiKey = formData.get('apiKey') as string | null;

      if (!isValidAdminKey(apiKey || formApiKey)) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Passkey tidak valid.' },
          { status: 401 }
        );
      }

      const file = formData.get('file') as File | null;
      const rawCaption = formData.get('caption') as string | null;
      const rawAuthor = formData.get('author') as string | null;
      const rawTimestamp =
        (formData.get('timestamp') as string | null) ||
        (formData.get('takenAt') as string | null) ||
        (formData.get('time') as string | null);
      const rawCategory = formData.get('category') as string | null;
      const rawIgStoryId = formData.get('igStoryId') as string | null;
      const rawMediaType = formData.get('mediaType') as 'image' | 'video' | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No media file provided.' },
          { status: 400 }
        );
      }

      const finalTimestamp = parseTimestamp(rawTimestamp);
      const timestampMs = new Date(finalTimestamp).getTime();
      const originalExt = path.extname(file.name).toLowerCase() || '.jpg';

      const isVideo =
        rawMediaType === 'video' ||
        file.type.startsWith('video/') ||
        ['.mp4', '.webm', '.mov', '.m4v'].includes(originalExt);

      const filename = `story-${timestampMs}${originalExt}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let mediaUrl = `/stories/${filename}`;
      const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
      const hfRepo = process.env.HF_DATASET_REPO;

      if (hfToken && hfRepo) {
        try {
          const { uploadFile } = await import('@huggingface/hub');
          const hfPath = `stories/${filename}`;
          await uploadFile({
            repo: { type: 'dataset', name: hfRepo },
            credentials: { accessToken: hfToken },
            file: {
              path: hfPath,
              content: new Blob([buffer]),
            },
          });
          mediaUrl = `https://huggingface.co/datasets/${hfRepo}/resolve/main/${hfPath}`;
        } catch (hfErr) {
          console.warn('[StoriesAPI] HF upload error, falling back to local/data url:', hfErr);
        }
      }

      // Try local save in development
      if (process.env.NODE_ENV === 'development') {
        try {
          await fs.mkdir(STORIES_DIR, { recursive: true });
          await fs.writeFile(path.join(STORIES_DIR, filename), buffer);
        } catch {
          // ignore in read-only environment
        }
      }

      const newStory: IGStory = {
        id: `story-${timestampMs}`,
        mediaUrl,
        mediaType: isVideo ? 'video' : 'image',
        caption: rawCaption ? rawCaption.trim() : '',
        timestamp: finalTimestamp,
        author: rawAuthor ? rawAuthor.trim().replace(/^@/, '') : 'comeinone.f',
        category: rawCategory ? rawCategory.trim() : 'General',
        igStoryId: rawIgStoryId ? rawIgStoryId.trim() : undefined,
        source: 'wabot',
        likes: Math.floor(Math.random() * 20) + 15,
      };

      const stories = await getStories();
      const updated = [newStory, ...stories];
      const writeResult = await saveStories(updated);

      return NextResponse.json({
        success: true,
        message: 'Story archived successfully with metadata!',
        story: newStory,
        syncedCloud: writeResult.syncedCloud,
      });
    }

    // 2. JSON payload
    if (contentType.includes('application/json')) {
      const body = await req.json();

      if (!isValidAdminKey(apiKey || body.apiKey)) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Passkey tidak valid.' },
          { status: 401 }
        );
      }

      let mediaUrl = body.mediaUrl;

      // Support base64 upload
      if (body.base64) {
        const ext = body.ext || (body.mediaType === 'video' ? '.mp4' : '.jpg');
        const filename = `story-${Date.now()}${ext}`;
        const base64Data = body.base64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
        const hfRepo = process.env.HF_DATASET_REPO;

        if (hfToken && hfRepo) {
          try {
            const { uploadFile } = await import('@huggingface/hub');
            const hfPath = `stories/${filename}`;
            await uploadFile({
              repo: { type: 'dataset', name: hfRepo },
              credentials: { accessToken: hfToken },
              file: {
                path: hfPath,
                content: new Blob([buffer]),
              },
            });
            mediaUrl = `https://huggingface.co/datasets/${hfRepo}/resolve/main/${hfPath}`;
          } catch {
            mediaUrl = body.base64;
          }
        } else {
          try {
            await fs.mkdir(STORIES_DIR, { recursive: true });
            await fs.writeFile(path.join(STORIES_DIR, filename), buffer);
            mediaUrl = `/stories/${filename}`;
          } catch {
            mediaUrl = body.base64;
          }
        }
      }

      if (!mediaUrl) {
        return NextResponse.json(
          { success: false, error: 'mediaUrl or base64 is required.' },
          { status: 400 }
        );
      }

      const finalTimestamp = parseTimestamp(body.timestamp || body.takenAt || body.time);
      const isVideo =
        body.mediaType === 'video' ||
        ['.mp4', '.webm', '.mov', '.m4v'].some((ext) =>
          mediaUrl.toLowerCase().includes(ext)
        );

      const newStory: IGStory = {
        id: body.id || `story-${new Date(finalTimestamp).getTime()}`,
        mediaUrl,
        mediaType: isVideo ? 'video' : 'image',
        caption: body.caption ? String(body.caption).trim() : '',
        timestamp: finalTimestamp,
        author: body.author ? String(body.author).trim().replace(/^@/, '') : 'comeinone.f',
        category: body.category ? String(body.category).trim() : 'General',
        igStoryId: body.igStoryId,
        source: body.source || 'wabot',
        likes: body.likes ?? (Math.floor(Math.random() * 20) + 15),
      };

      const stories = await getStories();
      const updated = [newStory, ...stories];
      const writeResult = await saveStories(updated);

      return NextResponse.json({
        success: true,
        message: 'Story archived successfully with metadata!',
        story: newStory,
        syncedCloud: writeResult.syncedCloud,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported Content-Type.' },
      { status: 415 }
    );
  } catch (error) {
    console.error('Error ingesting story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process story.' },
      { status: 500 }
    );
  }
}

// PUT /api/stories - Edit metadata of an existing story
export async function PUT(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();
    const formApiKey = body.apiKey;

    if (!isValidAdminKey(apiKey || formApiKey)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
        { status: 401 }
      );
    }

    const { id, caption, timestamp, author, category, mediaType, likes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Story ID is required.' },
        { status: 400 }
      );
    }

    const stories = await getStories();
    const index = stories.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Story not found.' },
        { status: 404 }
      );
    }

    const current = stories[index];
    const updatedStory: IGStory = {
      ...current,
      caption: caption !== undefined ? String(caption).trim() : current.caption,
      timestamp: timestamp ? parseTimestamp(timestamp) : current.timestamp,
      author: author !== undefined ? String(author).trim().replace(/^@/, '') : current.author,
      category: category !== undefined ? String(category).trim() : current.category,
      mediaType: mediaType || current.mediaType,
      likes: typeof likes === 'number' ? likes : current.likes,
    };

    stories[index] = updatedStory;
    const writeResult = await saveStories(stories);

    return NextResponse.json({
      success: true,
      message: 'Story metadata updated successfully!',
      story: updatedStory,
      syncedCloud: writeResult.syncedCloud,
    });
  } catch (error) {
    console.error('Error updating story metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update story metadata.' },
      { status: 500 }
    );
  }
}

// DELETE /api/stories?id=xyz - Delete archived story
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!isValidAdminKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Story ID is required.' },
        { status: 400 }
      );
    }

    const stories = await getStories();
    const target = stories.find((s) => s.id === id);
    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Story not found.' },
        { status: 404 }
      );
    }

    const filtered = stories.filter((s) => s.id !== id);
    const writeResult = await saveStories(filtered);

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully.',
      syncedCloud: writeResult.syncedCloud,
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete story.' },
      { status: 500 }
    );
  }
}
