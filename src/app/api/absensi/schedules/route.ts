import { NextResponse } from 'next/server';
import { readStorageFile } from '@/lib/serverStorage';

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
