import { NextResponse } from 'next/server';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export interface Meeting {
  id: string;
  courseName: string;
  teacherName?: string;
  meetingNumber: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  topic?: string;
  status: 'OPEN' | 'FINALIZED' | 'CANCELLED';
  createdAt: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get('status');

    const dataJson = await readStorageFile('database/meetings.json', '[]');
    let meetings: Meeting[] = [];
    try {
      meetings = JSON.parse(dataJson);
    } catch {
      meetings = [];
    }

    // Sort descending by date and meetingNumber
    meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.meetingNumber - a.meetingNumber);

    const activeMeeting = meetings.find((m) => m.status === 'OPEN');

    if (filterStatus) {
      const filtered = meetings.filter((m) => m.status === filterStatus);
      return NextResponse.json({ success: true, meetings: filtered, activeMeeting });
    }

    return NextResponse.json({
      success: true,
      meetings,
      activeMeeting,
    });
  } catch (err: any) {
    console.error('Meetings GET Error:', err);
    return NextResponse.json({ error: 'Gagal memuat data pertemuan' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseName, teacherName, meetingNumber, date, startTime, endTime, topic } = body;

    if (!courseName || !date) {
      return NextResponse.json({ error: 'Mata kuliah dan tanggal wajib diisi' }, { status: 400 });
    }

    const dataJson = await readStorageFile('database/meetings.json', '[]');
    let meetings: Meeting[] = [];
    try {
      meetings = JSON.parse(dataJson);
    } catch {
      meetings = [];
    }

    // Auto-close any previous OPEN meetings if creating a new one? Or allow secretary to close explicitly.
    // We can keep it open or let them manage multiple. But usually 1 open meeting at a time:
    const newMeeting: Meeting = {
      id: `mtg-${Date.now()}`,
      courseName: courseName.trim(),
      teacherName: teacherName ? teacherName.trim() : '',
      meetingNumber: Number(meetingNumber) || 1,
      date: date.trim(),
      startTime: startTime || '07:30',
      endTime: endTime || '12:45',
      topic: topic ? topic.trim() : '',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    meetings.unshift(newMeeting);

    await writeStorageFile('database/meetings.json', JSON.stringify(meetings, null, 2));

    return NextResponse.json({
      success: true,
      meeting: newMeeting,
      message: 'Pertemuan absensi berhasil dibuka!',
    });
  } catch (err: any) {
    console.error('Meetings POST Error:', err);
    return NextResponse.json({ error: 'Gagal membuat pertemuan absensi' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, topic, courseName, meetingNumber } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID pertemuan wajib disertakan' }, { status: 400 });
    }

    const dataJson = await readStorageFile('database/meetings.json', '[]');
    let meetings: Meeting[] = [];
    try {
      meetings = JSON.parse(dataJson);
    } catch {
      meetings = [];
    }

    const idx = meetings.findIndex((m) => m.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Pertemuan tidak ditemukan' }, { status: 404 });
    }

    if (status) meetings[idx].status = status;
    if (topic !== undefined) meetings[idx].topic = topic;
    if (courseName) meetings[idx].courseName = courseName;
    if (meetingNumber) meetings[idx].meetingNumber = Number(meetingNumber);

    await writeStorageFile('database/meetings.json', JSON.stringify(meetings, null, 2));

    return NextResponse.json({
      success: true,
      meeting: meetings[idx],
      message: `Status pertemuan diperbarui: ${meetings[idx].status}`,
    });
  } catch (err: any) {
    console.error('Meetings PUT Error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui pertemuan' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID pertemuan wajib disertakan' }, { status: 400 });
    }

    const dataJson = await readStorageFile('database/meetings.json', '[]');
    let meetings: Meeting[] = [];
    try {
      meetings = JSON.parse(dataJson);
    } catch {
      meetings = [];
    }

    const filtered = meetings.filter((m) => m.id !== id);
    await writeStorageFile('database/meetings.json', JSON.stringify(filtered, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Pertemuan berhasil dihapus',
    });
  } catch (err: any) {
    console.error('Meetings DELETE Error:', err);
    return NextResponse.json({ error: 'Gagal menghapus pertemuan' }, { status: 500 });
  }
}
