import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Song } from '@/types';

const SONGS_FILE = path.join(process.cwd(), 'src', 'data', 'songs.json');
const API_SECRET = process.env.STORY_BOT_SECRET || 'cef2024';

async function getSongs(): Promise<Song[]> {
  try {
    const data = await fs.readFile(SONGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSongs(songs: Song[]): Promise<void> {
  await fs.writeFile(SONGS_FILE, JSON.stringify(songs, null, 2), 'utf-8');
}

// GET /api/songs - Get all playlist songs
export async function GET() {
  const songs = await getSongs();
  return NextResponse.json({ success: true, songs });
}

// POST /api/songs - Add new song
export async function POST(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();

    if ((apiKey || body.apiKey) !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const {
      title,
      artist,
      album,
      coverUrl,
      audioUrl,
      spotifyUrl,
      appleMusicUrl,
      suggestedBy,
      studentId,
      note,
      category,
    } = body;

    if (!title || !artist || !coverUrl) {
      return NextResponse.json(
        { success: false, error: 'Judul lagu, artis, dan cover artwork wajib diisi.' },
        { status: 400 }
      );
    }

    const newSong: Song = {
      id: body.id?.trim() || `song-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim(),
      album: album?.trim() || undefined,
      coverUrl: coverUrl.trim(),
      audioUrl: audioUrl?.trim() || undefined,
      spotifyUrl: spotifyUrl?.trim() || undefined,
      appleMusicUrl: appleMusicUrl?.trim() || undefined,
      suggestedBy: suggestedBy?.trim() || 'Lagu Kebangsaan Kelas F',
      studentId: studentId || undefined,
      note: note?.trim() || undefined,
      category: category?.trim() || 'Class Anthem',
      addedAt: new Date().toISOString(),
    };

    const songs = await getSongs();
    const updated = [newSong, ...songs];
    await saveSongs(updated);

    return NextResponse.json({
      success: true,
      message: 'Lagu berhasil ditambahkan ke playlist kelas!',
      song: newSong,
    });
  } catch (error) {
    console.error('Error adding song:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan lagu ke playlist.' },
      { status: 500 }
    );
  }
}

// PUT /api/songs - Update existing song
export async function PUT(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();

    if ((apiKey || body.apiKey) !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { id } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Lagu wajib disertakan.' },
        { status: 400 }
      );
    }

    const songs = await getSongs();
    const index = songs.findIndex((s) => s.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Lagu tidak ditemukan dalam playlist.' },
        { status: 404 }
      );
    }

    const current = songs[index];
    const updatedSong: Song = {
      ...current,
      title: body.title !== undefined ? body.title.trim() : current.title,
      artist: body.artist !== undefined ? body.artist.trim() : current.artist,
      album: body.album !== undefined ? body.album.trim() : current.album,
      coverUrl: body.coverUrl !== undefined ? body.coverUrl.trim() : current.coverUrl,
      audioUrl: body.audioUrl !== undefined ? body.audioUrl.trim() : current.audioUrl,
      spotifyUrl: body.spotifyUrl !== undefined ? body.spotifyUrl.trim() : current.spotifyUrl,
      appleMusicUrl: body.appleMusicUrl !== undefined ? body.appleMusicUrl.trim() : current.appleMusicUrl,
      suggestedBy: body.suggestedBy !== undefined ? body.suggestedBy.trim() : current.suggestedBy,
      studentId: body.studentId !== undefined ? body.studentId : current.studentId,
      note: body.note !== undefined ? body.note.trim() : current.note,
      category: body.category !== undefined ? body.category.trim() : current.category,
    };

    songs[index] = updatedSong;
    await saveSongs(songs);

    return NextResponse.json({
      success: true,
      message: 'Lagu berhasil diperbarui!',
      song: updatedSong,
    });
  } catch (error) {
    console.error('Error updating song:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui lagu.' },
      { status: 500 }
    );
  }
}

// DELETE /api/songs?id=xyz - Delete song from playlist
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    let bodyData: { id?: string; apiKey?: string } = {};
    try {
      bodyData = await req.json();
    } catch {
      // Body may be empty if passing query params
    }

    if (!id && bodyData.id) {
      id = bodyData.id;
    }

    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      bodyData.apiKey;

    if (apiKey !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Lagu wajib disertakan.' },
        { status: 400 }
      );
    }

    const songs = await getSongs();
    const filtered = songs.filter((s) => s.id !== id);

    if (filtered.length === songs.length) {
      return NextResponse.json(
        { success: false, error: 'Lagu tidak ditemukan.' },
        { status: 404 }
      );
    }

    await saveSongs(filtered);

    return NextResponse.json({
      success: true,
      message: 'Lagu berhasil dihapus dari playlist.',
    });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus lagu.' },
      { status: 500 }
    );
  }
}
