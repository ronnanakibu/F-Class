import { NextRequest, NextResponse } from 'next/server';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';
import type { SlideItem } from '@/types';
import initialJourney from '@/data/journey.json';

const RELATIVE_PATH = 'src/data/journey.json';
const API_SECRET = process.env.STORY_BOT_SECRET || 'cef2024';
const DEFAULT_JOURNEY_JSON = JSON.stringify(initialJourney, null, 2);

async function getSlides(): Promise<SlideItem[]> {
  try {
    const raw = await readStorageFile(RELATIVE_PATH, DEFAULT_JOURNEY_JSON);
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = initialJourney;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return initialJourney as SlideItem[];
    }
    return parsed;
  } catch {
    return initialJourney as SlideItem[];
  }
}

async function saveSlides(slides: SlideItem[]) {
  return writeStorageFile(RELATIVE_PATH, JSON.stringify(slides, null, 2));
}

// GET /api/journey - Retrieve all journey slides
export async function GET() {
  const slides = await getSlides();
  return NextResponse.json({ success: true, slides });
}

// POST /api/journey - Add new slide or bulk update slides array
export async function POST(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();

    if ((apiKey || body.apiKey) !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
        { status: 401 }
      );
    }

    // Bulk update for reordering
    if (Array.isArray(body.slides)) {
      const result = await saveSlides(body.slides);
      return NextResponse.json({
        success: true,
        message: 'Urutan slide berhasil diperbarui!',
        isReadOnlyFs: result.isReadOnlyFs,
        slides: body.slides,
      });
    }

    const {
      title,
      subtitle,
      tag,
      semester,
      date,
      description,
      mediaUrl,
      mediaType,
      accentColor,
    } = body;

    if (!title || !description || !mediaUrl) {
      return NextResponse.json(
        { success: false, error: 'Judul, deskripsi, dan URL media wajib diisi.' },
        { status: 400 }
      );
    }

    const currentSlides = await getSlides();
    const newSlide: SlideItem = {
      id: `slide-${Date.now()}`,
      title,
      subtitle: subtitle || '',
      tag: tag || 'Milestone',
      semester: Number(semester) || 1,
      date: date || '2025',
      description,
      mediaUrl,
      mediaType: mediaType === 'video' ? 'video' : 'image',
      accentColor: accentColor || '#3b82f6',
    };

    const updated = [...currentSlides, newSlide];
    const result = await saveSlides(updated);

    return NextResponse.json({
      success: true,
      message: 'Slide baru berhasil ditambahkan!',
      isReadOnlyFs: result.isReadOnlyFs,
      slide: newSlide,
      slides: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// PUT /api/journey - Edit existing slide
export async function PUT(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();

    if ((apiKey || body.apiKey) !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
        { status: 401 }
      );
    }

    const {
      id,
      title,
      subtitle,
      tag,
      semester,
      date,
      description,
      mediaUrl,
      mediaType,
      accentColor,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Slide ID wajib disertakan.' },
        { status: 400 }
      );
    }

    const currentSlides = await getSlides();
    const slideIdx = currentSlides.findIndex((s) => s.id === id);

    if (slideIdx === -1) {
      return NextResponse.json(
        { success: false, error: 'Slide tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updatedSlide: SlideItem = {
      ...currentSlides[slideIdx],
      title: title ?? currentSlides[slideIdx].title,
      subtitle: subtitle ?? currentSlides[slideIdx].subtitle,
      tag: tag ?? currentSlides[slideIdx].tag,
      semester: semester ? Number(semester) : currentSlides[slideIdx].semester,
      date: date ?? currentSlides[slideIdx].date,
      description: description ?? currentSlides[slideIdx].description,
      mediaUrl: mediaUrl ?? currentSlides[slideIdx].mediaUrl,
      mediaType: mediaType ? (mediaType === 'video' ? 'video' : 'image') : currentSlides[slideIdx].mediaType,
      accentColor: accentColor ?? currentSlides[slideIdx].accentColor,
    };

    currentSlides[slideIdx] = updatedSlide;
    const result = await saveSlides(currentSlides);

    return NextResponse.json({
      success: true,
      message: 'Slide berhasil diperbarui!',
      isReadOnlyFs: result.isReadOnlyFs,
      slide: updatedSlide,
      slides: currentSlides,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/journey - Delete slide by ID
export async function DELETE(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const paramKey = searchParams.get('apiKey');

    if ((apiKey || paramKey) !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Slide ID is required.' },
        { status: 400 }
      );
    }

    const currentSlides = await getSlides();
    const filtered = currentSlides.filter((s) => s.id !== id);

    if (filtered.length === currentSlides.length) {
      return NextResponse.json(
        { success: false, error: 'Slide not found.' },
        { status: 404 }
      );
    }

    const result = await saveSlides(filtered);

    return NextResponse.json({
      success: true,
      message: 'Slide berhasil dihapus!',
      isReadOnlyFs: result.isReadOnlyFs,
      slides: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
