'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Search,
  Check,
  X,
  ChevronDown,
  Lock,
  Unlock,
  Sparkles,
  BookOpen,
  Download,
  Award,
} from 'lucide-react';
import { getInitials, stringToHue } from '@/lib/utils';

interface Meeting {
  id: string;
  courseName: string;
  teacherName?: string;
  meetingNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string;
  status: 'OPEN' | 'FINALIZED' | 'CANCELLED';
  createdAt: string;
}

interface ScheduleSlot {
  id: string;
  dayOfWeek: number;
  dayName: string;
  order: number;
  courseName: string;
  teacherName: string;
  startTime: string;
  endTime: string;
}

interface StudentAttendance {
  id: number | string;
  nim: string;
  name: string;
  role: string;
  photo?: string | null;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA' | 'BELUM';
  notes: string;
  timestamp: string;
}

interface RecapRow {
  id: number | string;
  nim: string;
  name: string;
  role: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  percentage: number;
  meetingStatuses: Record<string, string>;
}

export default function AdminAbsensiTab() {
  // Main Data States
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [recapData, setRecapData] = useState<RecapRow[]>([]);
  const [stats, setStats] = useState<any>(null);

  // UI View States
  const [viewMode, setViewMode] = useState<'grid' | 'recap'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Meeting Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedScheduleSlot, setSelectedScheduleSlot] = useState<string>('');
  const [formCourseName, setFormCourseName] = useState('');
  const [formTeacherName, setFormTeacherName] = useState('');
  const [formMeetingNumber, setFormMeetingNumber] = useState<number>(1);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('07:30');
  const [formEndTime, setFormEndTime] = useState('08:20');
  const [formTopic, setFormTopic] = useState('');
  const [isSubmittingMeeting, setIsSubmittingMeeting] = useState(false);

  // Load Schedules & Meetings on Mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load Meeting details when selectedMeetingId changes
  useEffect(() => {
    if (selectedMeetingId && viewMode === 'grid') {
      loadMeetingAttendance(selectedMeetingId);
    }
  }, [selectedMeetingId, viewMode]);

  // Load Recap when switching to recap view
  useEffect(() => {
    if (viewMode === 'recap') {
      loadRecapData();
    }
  }, [viewMode]);

  function showMessage(type: 'success' | 'error', text: string) {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  }

  async function loadInitialData() {
    setIsLoading(true);
    try {
      // 1. Fetch schedules
      const schedRes = await fetch('/api/absensi/schedules');
      const schedData = await schedRes.json();
      if (schedData.success) {
        setSchedules(schedData.schedules || []);
      }

      // 2. Fetch meetings
      const meetRes = await fetch('/api/absensi/meetings');
      const meetData = await meetRes.json();
      if (meetData.success) {
        const list: Meeting[] = meetData.meetings || [];
        setMeetings(list);

        // Auto select active meeting, or the most recent meeting
        const active = list.find((m) => m.status === 'OPEN');
        if (active) {
          setSelectedMeetingId(active.id);
        } else if (list.length > 0) {
          setSelectedMeetingId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load initial absensi data:', err);
      showMessage('error', 'Gagal memuat data awal absensi.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMeetingAttendance(meetingId: string) {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/absensi/admin?meetingId=${encodeURIComponent(meetingId)}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
        setStats(data.stats || null);
      } else {
        showMessage('error', data.error || 'Gagal memuat absensi pertemuan.');
      }
    } catch (err) {
      console.error('Failed to load meeting attendance:', err);
      showMessage('error', 'Koneksi error saat mengambil data absensi.');
    } finally {
      setIsRefreshing(false);
    }
  }

  async function loadRecapData() {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/absensi/admin?recap=true');
      const data = await res.json();
      if (data.success) {
        setRecapData(data.recap || []);
        if (data.meetings) setMeetings(data.meetings);
      } else {
        showMessage('error', data.error || 'Gagal memuat rekap absensi.');
      }
    } catch (err) {
      console.error('Failed to load recap data:', err);
      showMessage('error', 'Koneksi error saat mengambil rekap.');
    } finally {
      setIsRefreshing(false);
    }
  }

  // Handle schedule autofill selection
  function handleSelectSchedule(scheduleId: string) {
    setSelectedScheduleSlot(scheduleId);
    const found = schedules.find((s) => s.id === scheduleId);
    if (found) {
      setFormCourseName(found.courseName);
      setFormTeacherName(found.teacherName);
      setFormStartTime(found.startTime);
      setFormEndTime(found.endTime);

      // Auto-compute meeting number
      const existingForCourse = meetings.filter(
        (m) => m.courseName.toLowerCase() === found.courseName.toLowerCase()
      );
      setFormMeetingNumber(existingForCourse.length + 1);
    }
  }

  async function handleCreateMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!formCourseName || !formDate) {
      showMessage('error', 'Mata kuliah dan tanggal wajib diisi');
      return;
    }

    setIsSubmittingMeeting(true);
    try {
      const res = await fetch('/api/absensi/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: formCourseName,
          teacherName: formTeacherName,
          meetingNumber: formMeetingNumber,
          date: formDate,
          startTime: formStartTime,
          endTime: formEndTime,
          topic: formTopic,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showMessage('error', data.error || 'Gagal membuka pertemuan');
        setIsSubmittingMeeting(false);
        return;
      }

      showMessage('success', 'Pertemuan absensi berhasil dibuka!');
      setIsCreateModalOpen(false);
      setFormTopic('');

      // Reload meetings list and select new meeting
      const meetRes = await fetch('/api/absensi/meetings');
      const meetData = await meetRes.json();
      if (meetData.success) {
        setMeetings(meetData.meetings || []);
        if (data.meeting) {
          setSelectedMeetingId(data.meeting.id);
        }
      }
    } catch {
      showMessage('error', 'Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmittingMeeting(false);
    }
  }

  async function handleUpdateMeetingStatus(newStatus: 'OPEN' | 'FINALIZED' | 'CANCELLED') {
    if (!selectedMeetingId) return;
    try {
      const res = await fetch('/api/absensi/meetings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMeetingId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showMessage('error', data.error || 'Gagal memperbarui status pertemuan');
        return;
      }

      showMessage('success', `Status pertemuan diubah: ${newStatus}`);
      // Refresh list
      const meetRes = await fetch('/api/absensi/meetings');
      const meetData = await meetRes.json();
      if (meetData.success) {
        setMeetings(meetData.meetings || []);
      }
    } catch {
      showMessage('error', 'Gagal memperbarui status');
    }
  }

  async function handleMarkAllPresent() {
    if (!selectedMeetingId) return;
    if (!confirm('Tandai SEMUA 20 mahasiswa sebagai HADIR untuk pertemuan ini?')) return;

    try {
      const res = await fetch('/api/absensi/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark-all-present',
          meetingId: selectedMeetingId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showMessage('error', data.error || 'Gagal menandai semua hadir');
        return;
      }

      showMessage('success', 'Semua mahasiswa berhasil ditandai HADIR!');
      await loadMeetingAttendance(selectedMeetingId);
    } catch {
      showMessage('error', 'Terjadi kesalahan koneksi.');
    }
  }

  async function handleUpdateSingleStudent(nim: string, status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA', notes?: string) {
    if (!selectedMeetingId) return;

    // Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => (s.nim === nim ? { ...s, status, notes: notes !== undefined ? notes : s.notes } : s))
    );

    try {
      const res = await fetch('/api/absensi/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: selectedMeetingId,
          studentNim: nim,
          status,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showMessage('error', data.error || 'Gagal menyimpan status');
        await loadMeetingAttendance(selectedMeetingId);
      }
    } catch {
      showMessage('error', 'Gagal update status');
      await loadMeetingAttendance(selectedMeetingId);
    }
  }

  function exportRecapToCSV() {
    if (!recapData || recapData.length === 0) {
      showMessage('error', 'Belum ada data rekap untuk diexport.');
      return;
    }

    const meetingHeaders = meetings.map((m) => `"${m.courseName} (#${m.meetingNumber})"`).join(',');
    let csvContent = `data:text/csv;charset=utf-8,NIM,Nama,Peran,Total Hadir,Total Sakit,Total Izin,Total Alpa,Persentase Kehadiran,${meetingHeaders}\n`;

    recapData.forEach((row) => {
      const rowStatuses = meetings.map((m) => `"${row.meetingStatuses[m.id] || '-'}"`).join(',');
      csvContent += `"${row.nim}","${row.name}","${row.role}",${row.hadir},${row.sakit},${row.izin},${row.alpa},"${row.percentage}%",${rowStatuses}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Presensi_Kelas_F_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage('success', 'File CSV berhasil diunduh!');
  }

  // Filtered students in selected meeting grid
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nim.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const currentSelectedMeeting = useMemo(() => {
    return meetings.find((m) => m.id === selectedMeetingId) || null;
  }, [meetings, selectedMeetingId]);

  return (
    <div className="space-y-6">
      {/* Status Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-mono border flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{statusMessage.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header & Quick Action Bar */}
      <div className="rounded-2xl border border-white/10 bg-surface/70 p-5 md:p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                <Calendar size={18} />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-text-primary">
                  Absensi & Presensi Perkuliahan
                </h2>
                <p className="text-xs text-text-dim mt-0.5">
                  Kelola sesi absensi kelas F, sinkronisasi jadwal, dan ekspor rekap kehadiran
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Toggle View Mode */}
            <div className="bg-background/80 p-1 rounded-xl border border-white/10 flex items-center text-xs font-mono">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-accent text-background font-bold shadow-sm'
                    : 'text-text-dim hover:text-text-primary'
                }`}
              >
                📋 Sesi Pertemuan
              </button>
              <button
                onClick={() => setViewMode('recap')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'recap'
                    ? 'bg-accent text-background font-bold shadow-sm'
                    : 'text-text-dim hover:text-text-primary'
                }`}
              >
                📊 Rekap Semester
              </button>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover active:scale-95 text-background font-heading font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-accent/20 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Buka Pertemuan Baru</span>
            </button>

            <button
              onClick={() => {
                if (viewMode === 'grid' && selectedMeetingId) loadMeetingAttendance(selectedMeetingId);
                else loadRecapData();
              }}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: SESI PERTEMUAN (GRID VIEW) */}
      {viewMode === 'grid' && (
        <div className="space-y-5">
          {/* Meeting Selector & Active Meeting Status Bar */}
          <div className="rounded-2xl border border-white/10 bg-surface/50 p-4 md:p-5 backdrop-blur-sm space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Meeting Dropdown Selector */}
              <div className="flex-1 w-full md:w-auto">
                <label className="block text-[11px] font-mono text-text-dim uppercase tracking-wider mb-1.5">
                  Pilih Pertemuan Kelas:
                </label>
                <div className="relative">
                  <select
                    value={selectedMeetingId}
                    onChange={(e) => setSelectedMeetingId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-background/80 border border-white/10 text-sm font-medium text-text-primary pr-10 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {meetings.length === 0 && <option value="">Belum ada pertemuan dibuat</option>}
                    {meetings.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.status === 'OPEN' ? '🟢 [AKTIF] ' : m.status === 'FINALIZED' ? '🔒 [SELESAI] ' : '❌ [BATAL] '}
                        {m.courseName} — Pertemuan #{m.meetingNumber} ({m.date})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
                  />
                </div>
              </div>

              {/* Status Controls for Selected Meeting */}
              {currentSelectedMeeting && (
                <div className="flex items-center gap-2 pt-2 md:pt-5 w-full md:w-auto justify-end">
                  {currentSelectedMeeting.status === 'OPEN' ? (
                    <button
                      onClick={() => handleUpdateMeetingStatus('FINALIZED')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock size={13} />
                      <span>Tutup / Kunci Presensi</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateMeetingStatus('OPEN')}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Unlock size={13} />
                      <span>Buka Kembali Sesi</span>
                    </button>
                  )}

                  <button
                    onClick={handleMarkAllPresent}
                    className="px-3.5 py-2 rounded-xl bg-accent text-background font-mono text-xs font-bold hover:bg-accent-hover active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-accent/20 cursor-pointer"
                  >
                    <CheckCircle2 size={13} />
                    <span>⚡ Tandai Semua Hadir</span>
                  </button>
                </div>
              )}
            </div>

            {/* Selected Meeting Details Banner */}
            {currentSelectedMeeting && (
              <div className="pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-text-dim font-mono">Dosen Pengampu:</span>
                  <p className="font-medium text-text-primary mt-0.5 truncate">
                    {currentSelectedMeeting.teacherName || 'Belum diisi'}
                  </p>
                </div>
                <div>
                  <span className="text-text-dim font-mono">Jadwal Perkuliahan:</span>
                  <p className="font-medium text-text-primary mt-0.5">
                    {currentSelectedMeeting.startTime} - {currentSelectedMeeting.endTime} WIB
                  </p>
                </div>
                <div>
                  <span className="text-text-dim font-mono">Tanggal Pertemuan:</span>
                  <p className="font-medium text-text-primary mt-0.5">
                    {currentSelectedMeeting.date}
                  </p>
                </div>
                <div>
                  <span className="text-text-dim font-mono">Status Presensi:</span>
                  <p className="mt-0.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-mono text-[11px] ${
                        currentSelectedMeeting.status === 'OPEN'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                          : 'bg-white/10 text-text-dim border border-white/10'
                      }`}
                    >
                      {currentSelectedMeeting.status === 'OPEN' ? '🟢 Sesi Terbuka' : '🔒 Ditutup'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics of Current Meeting */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-xl border border-white/10 bg-surface/50 p-3.5 backdrop-blur-sm">
                <span className="text-[11px] font-mono text-text-dim">Total Mahasiswa</span>
                <p className="text-xl font-heading font-bold text-text-primary mt-1">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                <span className="text-[11px] font-mono text-emerald-400">Hadir</span>
                <p className="text-xl font-heading font-bold text-emerald-400 mt-1">
                  {stats.hadir}
                </p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                <span className="text-[11px] font-mono text-amber-400">Sakit</span>
                <p className="text-xl font-heading font-bold text-amber-400 mt-1">
                  {stats.sakit}
                </p>
              </div>
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5">
                <span className="text-[11px] font-mono text-sky-400">Izin</span>
                <p className="text-xl font-heading font-bold text-sky-400 mt-1">
                  {stats.izin}
                </p>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-mono text-red-400">Alpa / Belum</span>
                <p className="text-xl font-heading font-bold text-red-400 mt-1">
                  {stats.alpa + stats.unmarked}
                </p>
              </div>
            </div>
          )}

          {/* Search & Grid Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mahasiswa atau NIM..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background/80 border border-white/10 text-xs font-mono text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
              />
            </div>

            <div className="text-xs font-mono text-text-dim">
              Menampilkan {filteredStudents.length} mahasiswa
            </div>
          </div>

          {/* 20-Student Attendance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredStudents.map((student) => {
              const hue = stringToHue(student.name);
              const isHadir = student.status === 'HADIR';
              const isSakit = student.status === 'SAKIT';
              const isIzin = student.status === 'IZIN';
              const isAlpa = student.status === 'ALPA';

              return (
                <div
                  key={student.nim}
                  className={`rounded-xl border p-4 transition-all duration-200 backdrop-blur-sm ${
                    isHadir
                      ? 'border-emerald-500/30 bg-surface/80 shadow-sm shadow-emerald-500/5'
                      : isSakit
                      ? 'border-amber-500/30 bg-surface/80'
                      : isIzin
                      ? 'border-sky-500/30 bg-surface/80'
                      : isAlpa
                      ? 'border-red-500/30 bg-surface/80'
                      : 'border-white/10 bg-surface/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Student Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm shrink-0 border border-white/10 shadow-inner overflow-hidden"
                        style={{
                          backgroundColor: student.photo ? 'transparent' : `hsl(${hue}, 40%, 20%)`,
                          color: `hsl(${hue}, 80%, 70%)`,
                        }}
                      >
                        {student.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={student.photo}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(student.name)
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-semibold text-sm text-text-primary truncate">
                            {student.name}
                          </h4>
                          {student.role !== 'Anggota' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-accent/15 text-accent border border-accent/25 shrink-0">
                              {student.role}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-text-dim">
                          {student.nim}
                        </p>
                      </div>
                    </div>

                    {/* Quick 4-Toggle Status Buttons: H / S / I / A */}
                    <div className="flex items-center gap-1 shrink-0 bg-background/80 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => handleUpdateSingleStudent(student.nim, 'HADIR')}
                        title="Hadir"
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isHadir
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                            : 'text-text-dim hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        H
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSingleStudent(student.nim, 'SAKIT')}
                        title="Sakit"
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isSakit
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                            : 'text-text-dim hover:text-amber-400 hover:bg-amber-500/10'
                        }`}
                      >
                        S
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSingleStudent(student.nim, 'IZIN')}
                        title="Izin"
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isIzin
                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-105'
                            : 'text-text-dim hover:text-sky-400 hover:bg-sky-500/10'
                        }`}
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSingleStudent(student.nim, 'ALPA')}
                        title="Alpa"
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isAlpa
                            ? 'bg-red-500 text-white shadow-md shadow-red-500/30 scale-105'
                            : 'text-text-dim hover:text-red-400 hover:bg-red-500/10'
                        }`}
                      >
                        A
                      </button>
                    </div>
                  </div>

                  {/* Notes / Timestamp row if any */}
                  {(student.notes || student.timestamp) && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-text-dim">
                      <span className="truncate italic">
                        {student.notes ? `"${student.notes}"` : 'Tercatat'}
                      </span>
                      {student.timestamp && (
                        <span className="shrink-0 text-text-dim/80">
                          {new Date(student.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: REKAP SEMESTER (TABLE VIEW & CSV DOWNLOAD) */}
      {viewMode === 'recap' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-heading font-bold text-text-primary">
                Tabel Rekap Kehadiran Perkuliahan Kelas F
              </h3>
              <p className="text-xs text-text-dim mt-0.5">
                Total {meetings.length} pertemuan perkuliahan tercatat. Mahasiswa dengan kehadiran &lt; 75% ditandai perhatian.
              </p>
            </div>

            <button
              onClick={exportRecapToCSV}
              className="px-4 py-2 rounded-xl bg-accent text-background font-mono text-xs font-bold hover:bg-accent-hover active:scale-95 transition-all flex items-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer"
            >
              <Download size={14} />
              <span>Unduh Rekap CSV / Excel</span>
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface/60 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-20 bg-surface border-b border-white/10 font-mono text-text-dim uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 w-10">No</th>
                    <th className="px-4 py-3.5 min-w-[180px]">Nama Mahasiswa</th>
                    <th className="px-4 py-3.5 min-w-[100px]">NIM</th>
                    <th className="px-4 py-3.5 text-center w-16">Hadir</th>
                    <th className="px-4 py-3.5 text-center w-16">Sakit</th>
                    <th className="px-4 py-3.5 text-center w-16">Izin</th>
                    <th className="px-4 py-3.5 text-center w-16">Alpa</th>
                    <th className="px-4 py-3.5 text-center w-24">Rate (%)</th>
                    {meetings.map((m, idx) => (
                      <th
                        key={m.id}
                        className="px-3 py-3.5 text-center min-w-[90px] border-l border-white/5 truncate"
                        title={`${m.courseName} (#${m.meetingNumber}) - ${m.date}`}
                      >
                        P#{m.meetingNumber}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {recapData.map((row, idx) => {
                    const isWarning = row.percentage < 75;
                    return (
                      <tr key={row.nim} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-text-dim">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium font-sans text-text-primary truncate">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{row.nim}</td>
                        <td className="px-4 py-3 text-center text-emerald-400 font-bold">{row.hadir}</td>
                        <td className="px-4 py-3 text-center text-amber-400">{row.sakit}</td>
                        <td className="px-4 py-3 text-center text-sky-400">{row.izin}</td>
                        <td className="px-4 py-3 text-center text-red-400">{row.alpa}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              isWarning
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {row.percentage}%
                          </span>
                        </td>
                        {meetings.map((m) => {
                          const st = row.meetingStatuses[m.id] || '-';
                          const statusColors: Record<string, string> = {
                            HADIR: 'text-emerald-400 font-bold',
                            SAKIT: 'text-amber-400',
                            IZIN: 'text-sky-400',
                            ALPA: 'text-red-400 font-bold',
                            '-': 'text-text-dim',
                          };
                          return (
                            <td
                              key={m.id}
                              className={`px-3 py-3 text-center border-l border-white/5 ${statusColors[st] || ''}`}
                            >
                              {st === 'HADIR' ? 'H' : st === 'SAKIT' ? 'S' : st === 'IZIN' ? 'I' : st === 'ALPA' ? 'A' : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BUKA PERTEMUAN BARU */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-surface p-6 md:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                  <Calendar size={16} />
                </div>
                <h3 className="text-lg font-heading font-bold text-text-primary">
                  Buka Pertemuan Kelas Baru
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-dim hover:text-text-primary p-1 rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              {/* Quick autofill from weekly schedules */}
              <div>
                <label className="block text-xs font-mono text-accent uppercase tracking-wider mb-1.5">
                  ⚡ Isi Cepat dari Jadwal Mingguan (29 Slot):
                </label>
                <div className="relative">
                  <select
                    value={selectedScheduleSlot}
                    onChange={(e) => handleSelectSchedule(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background/80 border border-accent/30 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="">-- Pilih Mata Kuliah dari Jadwal --</option>
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.dayName} Les {s.order}] {s.courseName} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1">
                    Nama Mata Kuliah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCourseName}
                    onChange={(e) => setFormCourseName(e.target.value)}
                    placeholder="Contoh: Jaringan Komputer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-white/10 text-xs font-medium text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1">
                    Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    value={formTeacherName}
                    onChange={(e) => setFormTeacherName(e.target.value)}
                    placeholder="Nama dosen pengampu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-white/10 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1">
                    Pertemuan Ke-
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={formMeetingNumber}
                    onChange={(e) => setFormMeetingNumber(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-white/10 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-white/10 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-white/10 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">
                  Tanggal Pertemuan *
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-white/10 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">
                  Materi / Topik Perkuliahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="Misal: Konfigurasi Routing RIPv2 pada Cisco Packet Tracer"
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-white/10 text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-text-dim hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMeeting}
                  className="px-5 py-2.5 rounded-xl bg-accent text-background font-mono text-xs font-bold hover:bg-accent-hover active:scale-95 transition-all shadow-lg shadow-accent/20 disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSubmittingMeeting ? 'Membuka...' : '🚀 Buka Sesi Presensi Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
