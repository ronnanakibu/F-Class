import { NextResponse } from 'next/server';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';
import { Meeting } from '../meetings/route';

export const dynamic = 'force-dynamic';

export interface AttendanceRecord {
  id: string;
  meetingId: string;
  studentNim: string;
  studentName: string;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';
  notes?: string;
  timestamp: string;
  verifiedByAdmin?: boolean;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { meetingId, studentNim, studentName, status, notes } = body;

    if (!meetingId || !studentNim || !status) {
      return NextResponse.json({ error: 'Data absensi tidak lengkap' }, { status: 400 });
    }

    if (!['HADIR', 'SAKIT', 'IZIN'].includes(status)) {
      return NextResponse.json({ error: 'Status absensi tidak valid' }, { status: 400 });
    }

    // Verify meeting exists and is OPEN
    const meetingsJson = await readStorageFile('database/meetings.json', '[]');
    let meetings: Meeting[] = [];
    try {
      meetings = JSON.parse(meetingsJson);
    } catch {
      meetings = [];
    }

    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) {
      return NextResponse.json({ error: 'Pertemuan tidak ditemukan' }, { status: 404 });
    }

    if (meeting.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Presensi untuk pertemuan ini sudah ditutup oleh Sekretaris/Komting' },
        { status: 400 }
      );
    }

    // Read attendance list
    const attJson = await readStorageFile('database/attendance.json', '[]');
    let attendanceList: AttendanceRecord[] = [];
    try {
      attendanceList = JSON.parse(attJson);
    } catch {
      attendanceList = [];
    }

    const cleanNim = String(studentNim).trim();
    const existingIdx = attendanceList.findIndex(
      (a) => a.meetingId === meetingId && a.studentNim === cleanNim
    );

    const record: AttendanceRecord = {
      id: existingIdx !== -1 ? attendanceList[existingIdx].id : `att-${Date.now()}-${cleanNim}`,
      meetingId,
      studentNim: cleanNim,
      studentName: studentName || cleanNim,
      status,
      notes: notes ? String(notes).trim() : '',
      timestamp: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      attendanceList[existingIdx] = record;
    } else {
      attendanceList.push(record);
    }

    await writeStorageFile('database/attendance.json', JSON.stringify(attendanceList, null, 2));

    return NextResponse.json({
      success: true,
      message: `Presensi berhasil dicatat sebagai [${status}]`,
      attendance: record,
    });
  } catch (err: any) {
    console.error('Checkin POST Error:', err);
    return NextResponse.json({ error: 'Gagal mencatat presensi' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentNim = searchParams.get('studentNim');

    if (!studentNim) {
      return NextResponse.json({ error: 'NIM mahasiswa wajib disertakan' }, { status: 400 });
    }

    const cleanNim = String(studentNim).trim();

    // Load meetings and attendance
    const [meetingsJson, attJson] = await Promise.all([
      readStorageFile('database/meetings.json', '[]'),
      readStorageFile('database/attendance.json', '[]'),
    ]);

    let meetings: Meeting[] = [];
    let attendanceList: AttendanceRecord[] = [];
    try {
      meetings = JSON.parse(meetingsJson);
    } catch {
      meetings = [];
    }
    try {
      attendanceList = JSON.parse(attJson);
    } catch {
      attendanceList = [];
    }

    const completedOrOpenMeetings = meetings.filter((m) => m.status !== 'CANCELLED');
    const studentAttendance = attendanceList.filter((a) => a.studentNim === cleanNim);

    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;

    const history = completedOrOpenMeetings.map((m) => {
      const record = studentAttendance.find((a) => a.meetingId === m.id);
      let st: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA' = 'ALPA';
      let timestamp = '';
      let notes = '';

      if (record) {
        st = record.status;
        timestamp = record.timestamp;
        notes = record.notes || '';
      } else if (m.status === 'OPEN') {
        st = 'ALPA'; // Belum absen
      }

      if (st === 'HADIR') hadir++;
      else if (st === 'SAKIT') sakit++;
      else if (st === 'IZIN') izin++;
      else if (m.status === 'FINALIZED') alpa++;

      return {
        meetingId: m.id,
        courseName: m.courseName,
        meetingNumber: m.meetingNumber,
        date: m.date,
        startTime: m.startTime,
        endTime: m.endTime,
        meetingStatus: m.status,
        attendanceStatus: record ? record.status : (m.status === 'OPEN' ? 'BELUM' : 'ALPA'),
        timestamp,
        notes,
      };
    });

    const totalEligibleMeetings = completedOrOpenMeetings.length;
    const attendancePercentage =
      totalEligibleMeetings > 0 ? Math.round((hadir / totalEligibleMeetings) * 100) : 100;

    return NextResponse.json({
      success: true,
      stats: {
        totalMeetings: totalEligibleMeetings,
        hadir,
        sakit,
        izin,
        alpa,
        attendancePercentage,
      },
      history,
    });
  } catch (err: any) {
    console.error('Checkin GET Error:', err);
    return NextResponse.json({ error: 'Gagal memuat riwayat presensi' }, { status: 500 });
  }
}
