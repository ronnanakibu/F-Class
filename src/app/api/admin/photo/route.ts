import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const STUDENTS_DIR = path.join(process.cwd(), 'public', 'students');
const DATA_FILE_PATH = path.join(process.cwd(), 'data mahasiswa.json');

// POST: Upload photo for student ID or save external photo URL
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Ensure public/students directory exists
    await fs.mkdir(STUDENTS_DIR, { recursive: true });

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const id = formData.get('id')?.toString();
      const file = formData.get('file') as File | null;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Student ID is required' },
          { status: 400 }
        );
      }

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No image file provided' },
          { status: 400 }
        );
      }

      // Determine extension
      let ext = '.jpg';
      const originalName = file.name.toLowerCase();
      if (originalName.endsWith('.png') || file.type === 'image/png') ext = '.png';
      else if (originalName.endsWith('.webp') || file.type === 'image/webp') ext = '.webp';
      else if (originalName.endsWith('.jpeg')) ext = '.jpeg';

      // Clean up previous files for this student ID to avoid duplicate extensions
      const existingFiles = await fs.readdir(STUDENTS_DIR);
      for (const f of existingFiles) {
        if (f.startsWith(`${id}.`)) {
          try {
            await fs.unlink(path.join(STUDENTS_DIR, f));
          } catch {
            // ignore
          }
        }
      }

      // Convert file buffer and save
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const targetFilename = `${id}${ext}`;
      const targetFilePath = path.join(STUDENTS_DIR, targetFilename);

      await fs.writeFile(targetFilePath, buffer);

      const publicUrl = `/students/${targetFilename}`;

      // Automatically update photo field in data mahasiswa.json
      try {
        const rawContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        const students = JSON.parse(rawContent);
        const updated = students.map((s: { id: number | string; photo?: string }) => {
          if (String(s.id) === String(id)) {
            return { ...s, photo: publicUrl };
          }
          return s;
        });
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(updated, null, 4), 'utf-8');
      } catch {
        // ignore json sync error
      }

      return NextResponse.json({
        success: true,
        message: `Foto mahasiswa ID ${id} berhasil diupload!`,
        url: publicUrl,
        filename: targetFilename,
      });
    }

    // Handle JSON body for external photo URLs
    const body = await request.json();
    const { id, photoUrl } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Update the photo field in data mahasiswa.json
    const rawContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const students = JSON.parse(rawContent);
    const updated = students.map((s: { id: number | string; photo?: string }) => {
      if (String(s.id) === String(id)) {
        if (photoUrl && photoUrl.trim() !== '') {
          return { ...s, photo: photoUrl.trim() };
        } else {
          const { photo, ...rest } = s;
          return rest;
        }
      }
      return s;
    });

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(updated, null, 4), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Foto profil mahasiswa ID ${id} berhasil diperbarui!`,
      url: photoUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save photo' },
      { status: 500 }
    );
  }
}

// DELETE: Remove photo file for student ID and clear from data mahasiswa.json
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    let deleted = false;
    try {
      const files = await fs.readdir(STUDENTS_DIR);
      for (const file of files) {
        if (file.startsWith(`${id}.`)) {
          await fs.unlink(path.join(STUDENTS_DIR, file));
          deleted = true;
        }
      }
    } catch {
      // ignore
    }

    // Clear from data mahasiswa.json so it reliably falls back to initials
    try {
      const rawContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      const students = JSON.parse(rawContent);
      const updated = students.map((s: { id: number | string; photo?: string }) => {
        if (String(s.id) === String(id)) {
          const { photo, ...rest } = s;
          return rest;
        }
        return s;
      });
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(updated, null, 4), 'utf-8');
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: deleted ? `Foto ID ${id} dihapus, kini menggunakan inisial!` : 'Foto dihapus, kembali ke inisial!',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
