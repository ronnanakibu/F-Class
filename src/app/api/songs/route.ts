import { NextRequest, NextResponse } from 'next/server';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';
import { isValidAdminKey } from '@/lib/auth';
import type { Song } from '@/types';
import initialSongs from '@/data/songs.json';

const RELATIVE_PATH = 'songs.json';
const DEFAULT_SONGS_JSON = JSON.stringify(initialSongs, null, 2);

export const dynamic = 'force-dynamic';

async function getSongs(): Promise<Song[]> {
  try {
    const raw = await readStorageFile(RELATIVE_PATH, DEFAULT_SONGS_JSON);
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = initialSongs;
    }
    if (!Array.isArray(data) || data.length === 0) {
      return initialSongs as Song[];
    }
    return data;
  } catch {
    return initialSongs as Song[];
  }
}

async function saveSongs(songs: Song[]) {
  return writeStorageFile(RELATIVE_PATH, JSON.stringify(songs, null, 2));
}

// GET /api/songs - Get all playlist songs
export async function GET() {
  const songs = await getSongs();
  return NextResponse.json(
    { success: true, songs },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    }
  );
}

// POST /api/songs - Add new song
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      body.apiKey;

    if (!isValidAdminKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
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
    const writeResult = await saveSongs(updated);

    return NextResponse.json({
      success: true,
      message: 'Lagu berhasil ditambahkan ke playlist kelas!',
      song: newSong,
      syncedCloud: writeResult.syncedCloud,
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
    const body = await req.json();
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      body.apiKey;

    if (!isValidAdminKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
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
    const writeResult = await saveSongs(songs);

    return NextResponse.json({
      success: true,
      message: 'Lagu berhasil diperbarui!',
      song: updatedSong,
      syncedCloud: writeResult.syncedCloud,
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

    if (!isValidAdminKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
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

    const writeResult = await saveSongs(filtered);

    return NextResponse.json({
      success: true,
      message: 'Lagu berhasil dihapus dari playlist.',
      syncedCloud: writeResult.syncedCloud,
    });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus lagu.' },
      { status: 500 }
    );
  }
}
