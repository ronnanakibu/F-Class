import { NextResponse } from 'next/server';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';
import { Meeting } from '../meetings/route';
import { AttendanceRecord } from '../checkin/route';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');
    const isRecap = searchParams.get('recap') === 'true';

    // Load students, meetings, and attendance
    const [studentsJson, meetingsJson, attJson] = await Promise.all([
      readStorageFile('students.json', '[]'),
      readStorageFile('database/meetings.json', '[]'),
      readStorageFile('database/attendance.json', '[]'),
    ]);

    let students: any[] = [];
    let meetings: Meeting[] = [];
    let attendanceList: AttendanceRecord[] = [];

    try {
      students = JSON.parse(studentsJson);
    } catch {
      students = [];
    }
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

    // If recap requested: calculate full matrix for all students across all finalized/open meetings
    if (isRecap) {
      const activeMeetings = meetings.filter((m) => m.status !== 'CANCELLED');
      const recapData = students.map((st) => {
        let hadir = 0;
        let sakit = 0;
        let izin = 0;
        let alpa = 0;

        const meetingStatuses: Record<string, string> = {};

        activeMeetings.forEach((m) => {
          const rec = attendanceList.find(
            (a) => a.meetingId === m.id && a.studentNim === st.nim
          );
          if (rec) {
            meetingStatuses[m.id] = rec.status;
            if (rec.status === 'HADIR') hadir++;
            else if (rec.status === 'SAKIT') sakit++;
            else if (rec.status === 'IZIN') izin++;
            else if (rec.status === 'ALPA') alpa++;
          } else {
            if (m.status === 'FINALIZED') {
              meetingStatuses[m.id] = 'ALPA';
              alpa++;
            } else {
              meetingStatuses[m.id] = '-';
            }
          }
        });

        const total = activeMeetings.length;
        const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;

        return {
          id: st.id,
          nim: st.nim,
          name: st.name,
          role: st.role,
          hadir,
          sakit,
          izin,
          alpa,
          percentage,
          meetingStatuses,
        };
      });

      return NextResponse.json({
        success: true,
        meetings: activeMeetings,
        recap: recapData,
      });
    }

    if (!meetingId) {
      return NextResponse.json({ error: 'meetingId wajib disertakan atau gunakan ?recap=true' }, { status: 400 });
    }

    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) {
      return NextResponse.json({ error: 'Pertemuan tidak ditemukan' }, { status: 404 });
    }

    const meetingAttendance = attendanceList.filter((a) => a.meetingId === meetingId);

    let countHadir = 0;
    let countSakit = 0;
    let countIzin = 0;
    let countAlpa = 0;
    let countUnmarked = 0;

    const studentGrid = students.map((st) => {
      const rec = meetingAttendance.find((a) => a.studentNim === st.nim);
      const status = rec ? rec.status : 'BELUM';
      const notes = rec ? rec.notes || '' : '';
      const timestamp = rec ? rec.timestamp : '';

      if (status === 'HADIR') countHadir++;
      else if (status === 'SAKIT') countSakit++;
      else if (status === 'IZIN') countIzin++;
      else if (status === 'ALPA') countAlpa++;
      else countUnmarked++;

      return {
        id: st.id,
        nim: st.nim,
        name: st.name,
        role: st.role,
        photo: st.photo || null,
        status,
        notes,
        timestamp,
      };
    });

    return NextResponse.json({
      success: true,
      meeting,
      stats: {
        totalStudents: students.length,
        hadir: countHadir,
        sakit: countSakit,
        izin: countIzin,
        alpa: countAlpa,
        unmarked: countUnmarked,
      },
      students: studentGrid,
    });
  } catch (err: any) {
    console.error('Admin Attendance GET Error:', err);
    return NextResponse.json({ error: 'Gagal memuat data absensi admin' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, meetingId, updates, studentNim, status, notes } = body;

    if (!meetingId) {
      return NextResponse.json({ error: 'meetingId wajib disertakan' }, { status: 400 });
    }

    const [studentsJson, attJson] = await Promise.all([
      readStorageFile('students.json', '[]'),
      readStorageFile('database/attendance.json', '[]'),
    ]);

    let students: any[] = [];
    let attendanceList: AttendanceRecord[] = [];

    try {
      students = JSON.parse(studentsJson);
    } catch {
      students = [];
    }
    try {
      attendanceList = JSON.parse(attJson);
    } catch {
      attendanceList = [];
    }

    if (action === 'mark-all-present') {
      // Set all 20 students to HADIR for this meetingId
      const now = new Date().toISOString();
      students.forEach((st) => {
        const idx = attendanceList.findIndex(
          (a) => a.meetingId === meetingId && a.studentNim === st.nim
        );
        const record: AttendanceRecord = {
          id: idx !== -1 ? attendanceList[idx].id : `att-${Date.now()}-${st.nim}`,
          meetingId,
          studentNim: st.nim,
          studentName: st.name,
          status: 'HADIR',
          notes: 'Diverifikasi Komting/Sekretaris',
          timestamp: now,
          verifiedByAdmin: true,
        };

        if (idx !== -1) {
          attendanceList[idx] = record;
        } else {
          attendanceList.push(record);
        }
      });

      await writeStorageFile('database/attendance.json', JSON.stringify(attendanceList, null, 2));

      return NextResponse.json({
        success: true,
        message: 'Semua mahasiswa berhasil ditandai HADIR!',
      });
    }

    if (action === 'bulk-update' && Array.isArray(updates)) {
      const now = new Date().toISOString();
      updates.forEach((u: any) => {
        const student = students.find((s) => s.nim === u.studentNim);
        const idx = attendanceList.findIndex(
          (a) => a.meetingId === meetingId && a.studentNim === u.studentNim
        );
        const record: AttendanceRecord = {
          id: idx !== -1 ? attendanceList[idx].id : `att-${Date.now()}-${u.studentNim}`,
          meetingId,
          studentNim: u.studentNim,
          studentName: student ? student.name : u.studentNim,
          status: u.status,
          notes: u.notes || '',
          timestamp: now,
          verifiedByAdmin: true,
        };

        if (idx !== -1) {
          attendanceList[idx] = record;
        } else {
          attendanceList.push(record);
        }
      });

      await writeStorageFile('database/attendance.json', JSON.stringify(attendanceList, null, 2));

      return NextResponse.json({
        success: true,
        message: 'Perubahan presensi berhasil disimpan',
      });
    }

    if (studentNim && status) {
      // Single student update
      const student = students.find((s) => s.nim === studentNim);
      const idx = attendanceList.findIndex(
        (a) => a.meetingId === meetingId && a.studentNim === studentNim
      );
      const record: AttendanceRecord = {
        id: idx !== -1 ? attendanceList[idx].id : `att-${Date.now()}-${studentNim}`,
        meetingId,
        studentNim,
        studentName: student ? student.name : studentNim,
        status,
        notes: notes || '',
        timestamp: new Date().toISOString(),
        verifiedByAdmin: true,
      };

      if (idx !== -1) {
        attendanceList[idx] = record;
      } else {
        attendanceList.push(record);
      }

      await writeStorageFile('database/attendance.json', JSON.stringify(attendanceList, null, 2));

      return NextResponse.json({
        success: true,
        message: `Presensi ${student?.name || studentNim} diperbarui menjadi ${status}`,
        record,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin Attendance POST Error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui data absensi' }, { status: 500 });
  }
}
