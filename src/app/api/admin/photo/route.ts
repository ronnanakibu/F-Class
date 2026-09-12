import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';

const STUDENTS_DIR = path.join(process.cwd(), 'public', 'students');
const RELATIVE_DATA_PATH = 'data mahasiswa.json';

// POST: Upload photo for student ID or save external photo URL
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

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

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let photoUrl = '';

      const targetFilename = `${id}${ext}`;
      const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
      const hfRepo = process.env.HF_DATASET_REPO;

      // Priority 1: DIRECT TO HUGGING FACE CLOUD STORAGE
      if (hfToken && hfRepo) {
        try {
          const { uploadFile } = await import('@huggingface/hub');
          const hfPath = `students/${targetFilename}`;
          await uploadFile({
            repo: { type: 'dataset', name: hfRepo },
            credentials: { accessToken: hfToken },
            file: {
              path: hfPath,
              content: new Blob([buffer]),
            },
          });
          photoUrl = `https://huggingface.co/datasets/${hfRepo}/resolve/main/${hfPath}`;
          console.info(`[PhotoAPI] Uploaded photo directly to Hugging Face: ${photoUrl}`);
        } catch (hfErr) {
          console.warn('[PhotoAPI] Hugging Face upload failed, trying local:', hfErr);
        }
      }

      // Priority 2: Local disk (development)
      if (!photoUrl) {
        try {
          await fs.mkdir(STUDENTS_DIR, { recursive: true });
          const targetFilePath = path.join(STUDENTS_DIR, targetFilename);
          await fs.writeFile(targetFilePath, buffer);
          photoUrl = `/students/${targetFilename}`;
        } catch (writeErr: any) {
          // Priority 3: Base64 data URL fallback
          const mimeType = file.type || 'image/jpeg';
          photoUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
        }
      }

      // Automatically update photo field in data mahasiswa.json via serverStorage
      try {
        const rawContent = await readStorageFile(RELATIVE_DATA_PATH);
        let studentsList: any[] = [];
        try {
          studentsList = JSON.parse(rawContent);
        } catch {
          studentsList = [];
        }

        const updated = studentsList.map((s: { id: number | string; photo?: string }) => {
          if (String(s.id) === String(id)) {
            return { ...s, photo: photoUrl };
          }
          return s;
        });
        await writeStorageFile(RELATIVE_DATA_PATH, JSON.stringify(updated, null, 4));
      } catch (syncErr) {
        console.warn('[PhotoAPI] Error updating data mahasiswa.json:', syncErr);
      }

      return NextResponse.json({
        success: true,
        message: `Foto mahasiswa ID ${id} berhasil diupload!`,
        url: photoUrl,
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
    const rawContent = await readStorageFile(RELATIVE_DATA_PATH, '[]');
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

    await writeStorageFile(RELATIVE_DATA_PATH, JSON.stringify(updated, null, 4));

    return NextResponse.json({
      success: true,
      message: photoUrl ? 'URL foto berhasil diperbarui!' : 'Foto dihapus, kembali ke inisial.',
      url: photoUrl || null,
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
      // ignore in read-only environment
    }

    // Clear from data mahasiswa.json so it reliably falls back to initials
    try {
      const rawContent = await readStorageFile(RELATIVE_DATA_PATH, '[]');
      const students = JSON.parse(rawContent);
      const updated = students.map((s: { id: number | string; photo?: string }) => {
        if (String(s.id) === String(id)) {
          const { photo, ...rest } = s;
          return rest;
        }
        return s;
      });
      await writeStorageFile(RELATIVE_DATA_PATH, JSON.stringify(updated, null, 4));
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
