import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { IGStory } from '@/types';

const STORIES_FILE = path.join(process.cwd(), 'src', 'data', 'stories.json');
const STORIES_DIR = path.join(process.cwd(), 'public', 'stories');
const API_SECRET = process.env.STORY_BOT_SECRET || 'cef2024';

// Helper to safely parse any incoming timestamp (Unix seconds, ms, ISO string) or default to now
function parseTimestamp(rawDate?: string | number | null): string {
  if (!rawDate) return new Date().toISOString();

  // If it's a unix timestamp in seconds (10 digits) or ms (13 digits)
  if (typeof rawDate === 'number' || /^\d+$/.test(String(rawDate).trim())) {
    const num = Number(rawDate);
    // If < 10000000000, it's seconds, multiply by 1000
    const ms = num < 10000000000 ? num * 1000 : num;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // If ISO or standard date string
  const d = new Date(rawDate);
  if (!isNaN(d.getTime())) return d.toISOString();

  return new Date().toISOString();
}

async function getStories(): Promise<IGStory[]> {
  try {
    const data = await fs.readFile(STORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveStories(stories: IGStory[]): Promise<void> {
  await fs.writeFile(STORIES_FILE, JSON.stringify(stories, null, 2), 'utf-8');
}

// GET /api/stories - Return all archived stories sorted newest first
export async function GET() {
  const stories = await getStories();
  const sorted = [...stories].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return NextResponse.json({ success: true, stories: sorted });
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

      if ((apiKey || formApiKey) !== API_SECRET) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Invalid API key.' },
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

      await fs.mkdir(STORIES_DIR, { recursive: true });

      const finalTimestamp = parseTimestamp(rawTimestamp);
      const timestampMs = new Date(finalTimestamp).getTime();
      const originalExt = path.extname(file.name).toLowerCase() || '.jpg';

      const isVideo =
        rawMediaType === 'video' ||
        file.type.startsWith('video/') ||
        ['.mp4', '.webm', '.mov', '.m4v'].includes(originalExt);

      const filename = `story-${timestampMs}${originalExt}`;
      const filepath = path.join(STORIES_DIR, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filepath, buffer);

      const newStory: IGStory = {
        id: `story-${timestampMs}`,
        mediaUrl: `/stories/${filename}`,
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
      await saveStories(updated);

      return NextResponse.json({
        success: true,
        message: 'Story archived successfully with metadata!',
        story: newStory,
      });
    }

    // 2. JSON payload (e.g. from WhatsApp Bot with base64 or remote mediaUrl)
    if (contentType.includes('application/json')) {
      const body = await req.json();

      if ((apiKey || body.apiKey) !== API_SECRET) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Invalid API key.' },
          { status: 401 }
        );
      }

      let mediaUrl = body.mediaUrl;

      // Support base64 upload
      if (body.base64) {
        await fs.mkdir(STORIES_DIR, { recursive: true });
        const ext = body.ext || (body.mediaType === 'video' ? '.mp4' : '.jpg');
        const filename = `story-${Date.now()}${ext}`;
        const filepath = path.join(STORIES_DIR, filename);
        const base64Data = body.base64.replace(/^data:[^;]+;base64,/, '');
        await fs.writeFile(filepath, Buffer.from(base64Data, 'base64'));
        mediaUrl = `/stories/${filename}`;
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
      await saveStories(updated);

      return NextResponse.json({
        success: true,
        message: 'Story archived successfully with metadata!',
        story: newStory,
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

    if ((apiKey || formApiKey) !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
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
    await saveStories(stories);

    return NextResponse.json({
      success: true,
      message: 'Story metadata updated successfully!',
      story: updatedStory,
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

    if (apiKey !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
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

    // Try deleting physical file if in /stories/
    if (target.mediaUrl.startsWith('/stories/')) {
      const filename = path.basename(target.mediaUrl);
      const filepath = path.join(STORIES_DIR, filename);
      try {
        await fs.unlink(filepath);
      } catch {
        // file may already not exist
      }
    }

    const filtered = stories.filter((s) => s.id !== id);
    await saveStories(filtered);

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete story.' },
      { status: 500 }
    );
  }
}
