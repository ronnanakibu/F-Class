import { NextResponse } from 'next/server';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dataJson = await readStorageFile('database/schedules.json', '[]');
    let schedules = [];
    try {
      schedules = JSON.parse(dataJson);
    } catch {
      schedules = [];
    }
    return NextResponse.json({ success: true, schedules });
  } catch (err: any) {
    console.error('Schedules API Error:', err);
    return NextResponse.json({ error: 'Gagal memuat jadwal' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) return NextResponse.json({ error: 'Akses ditolak. Passkey diperlukan.' }, { status: 401 });

    const body = await req.json();
    const dataJson = await readStorageFile('database/schedules.json', '[]');
    const schedules = JSON.parse(dataJson);
    
    schedules.push({ ...body, id: crypto.randomUUID() });
    await writeStorageFile('database/schedules.json', JSON.stringify(schedules, null, 2));
    
    return NextResponse.json({ success: true, schedules });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal menambah jadwal' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;
    
    const dataJson = await readStorageFile('database/schedules.json', '[]');
    const schedules = JSON.parse(dataJson);
    
    const idx = schedules.findIndex((s: any) => s.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    
    schedules[idx] = { ...schedules[idx], ...updates };
    await writeStorageFile('database/schedules.json', JSON.stringify(schedules, null, 2));
    
    return NextResponse.json({ success: true, schedules });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal memperbarui jadwal' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID jadwal diperlukan' }, { status: 400 });

    const dataJson = await readStorageFile('database/schedules.json', '[]');
    let schedules = JSON.parse(dataJson);
    
    schedules = schedules.filter((s: any) => s.id !== id);
    await writeStorageFile('database/schedules.json', JSON.stringify(schedules, null, 2));
    
    return NextResponse.json({ success: true, schedules });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal menghapus jadwal' }, { status: 500 });
  }
}
