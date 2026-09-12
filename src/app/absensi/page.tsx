'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserSession {
  id: string;
  username: string;
  name: string;
  nim: string;
  role: string;
  classRole: string;
  mustChangePassword?: boolean;
}

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
}

interface AttendanceHistoryItem {
  meetingId: string;
  courseName: string;
  meetingNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  meetingStatus: string;
  attendanceStatus: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA' | 'BELUM';
  timestamp?: string;
  notes?: string;
}

interface Stats {
  totalMeetings: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  attendancePercentage: number;
}

export default function AbsensiPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Login form states
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Portal data
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceHistoryItem | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState('');
  const [checkinError, setCheckinError] = useState('');
  const [selectedNote, setSelectedNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState<'SAKIT' | 'IZIN' | null>(null);

  // Change password states
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('absensi_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {
        localStorage.removeItem('absensi_user');
      }
    }
    setLoading(false);
  }, []);

  // Fetch meeting and student attendance once user is logged in
  useEffect(() => {
    if (!user) return;
    fetchPortalData();
  }, [user]);

  async function fetchPortalData() {
    if (!user) return;
    try {
      // 1. Fetch active meeting
      const meetingRes = await fetch('/api/absensi/meetings');
      const meetingData = await meetingRes.json();
      if (meetingData.success) {
        setActiveMeeting(meetingData.activeMeeting || null);
      }

      // 2. Fetch student history & stats
      const historyRes = await fetch(`/api/absensi/checkin?studentNim=${encodeURIComponent(user.nim)}`);
      const historyData = await historyRes.json();
      if (historyData.success) {
        setStats(historyData.stats);
        setHistory(historyData.history || []);

        if (meetingData.activeMeeting) {
          const cur = historyData.history?.find(
            (h: AttendanceHistoryItem) => h.meetingId === meetingData.activeMeeting.id
          );
          setCurrentAttendance(cur || null);
        }
      }
    } catch (err) {
      console.error('Failed to load portal data', err);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/absensi/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Login gagal. Periksa NIM & Password.');
        setIsLoggingIn(false);
        return;
      }

      setUser(data.user);
      localStorage.setItem('absensi_user', JSON.stringify(data.user));
      setPasswordInput('');
    } catch {
      setLoginError('Koneksi ke server gagal. Coba lagi.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('absensi_user');
    setActiveMeeting(null);
    setStats(null);
    setHistory([]);
  }

  async function handleCheckin(status: 'HADIR' | 'SAKIT' | 'IZIN', notes: string = '') {
    if (!activeMeeting || !user) return;
    setCheckinLoading(true);
    setCheckinError('');
    setCheckinSuccess('');

    try {
      const res = await fetch('/api/absensi/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: activeMeeting.id,
          studentNim: user.nim,
          studentName: user.name,
          status,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCheckinError(data.error || 'Gagal menyimpan presensi.');
        setCheckinLoading(false);
        return;
      }

      setCheckinSuccess(`Presensi berhasil dicatat sebagai [${status}]!`);
      setShowNoteModal(null);
      setSelectedNote('');
      await fetchPortalData();
    } catch {
      setCheckinError('Terjadi kesalahan koneksi.');
    } finally {
      setCheckinLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPass !== confirmNewPass) {
      setPassError('Konfirmasi sandi baru tidak cocok');
      return;
    }

    if (newPass.length < 4) {
      setPassError('Sandi minimal 4 karakter');
      return;
    }

    setPassLoading(true);
    try {
      const res = await fetch('/api/absensi/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          username: user?.username,
          password: currentPass,
          newPassword: newPass,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPassError(data.error || 'Gagal mengganti sandi');
        setPassLoading(false);
        return;
      }

      setPassSuccess('Sandi berhasil diubah!');
      setTimeout(() => {
        setShowChangePassModal(false);
        setCurrentPass('');
        setNewPass('');
        setConfirmNewPass('');
        setPassSuccess('');
      }, 1500);
    } catch {
      setPassError('Gagal mengubah password. Periksa koneksi.');
    } finally {
      setPassLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs text-text-dim">Memuat Portal Absensi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-accent/30 selection:text-accent">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-white/5 px-4 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-sm font-mono text-text-dim hover:text-text-primary transition-colors"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Kembali ke Website Utama</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-xs">
              Kelas F &bull; Presensi Digital
            </span>
            {user && (
              <button
                onClick={handleLogout}
                className="text-xs font-mono text-red-400/90 hover:text-red-300 hover:bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 transition-all"
              >
                Keluar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8 md:py-12">
        {!user ? (
          /* ================= LOGIN CARD ================= */
          <div className="max-w-md mx-auto my-6">
            <div className="rounded-3xl border border-white/10 bg-surface/80 p-7 md:p-9 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center text-2xl shadow-inner">
                  📋
                </div>
                <h1 className="text-2xl font-heading font-bold text-text-primary tracking-tight">
                  Portal Presensi Mahasiswa
                </h1>
                <p className="text-xs md:text-sm text-text-dim mt-1.5">
                  Masuk untuk mencatat kehadiran perkuliahan Kelas F
                </p>
              </div>

              {loginError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-mono leading-relaxed">
                  ⚠️ {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-2">
                    NIM Mahasiswa
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Contoh: 2505112097"
                    className="w-full px-4 py-3 rounded-xl bg-background/60 border border-white/10 text-text-primary placeholder:text-text-dim text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-mono text-text-dim hover:text-accent transition-colors"
                    >
                      {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="4 digit terakhir NIM"
                    className="w-full px-4 py-3 rounded-xl bg-background/60 border border-white/10 text-text-primary placeholder:text-text-dim text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>

                <div className="p-3 rounded-xl bg-accent/5 border border-accent/15 text-[11px] text-text-secondary leading-relaxed font-sans">
                  💡 <strong>Info Login Awal:</strong> Masukkan <strong>NIM</strong> lengkap Anda dan sandi awal berupa <strong>4 digit terakhir NIM</strong>.
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-accent hover:bg-accent-hover active:scale-[0.99] text-background font-heading font-bold text-sm shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <span>Masuk ke Portal Presensi ➔</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ================= LOGGED IN PORTAL ================= */
          <div className="space-y-8">
            {/* User Profile Banner */}
            <div className="rounded-3xl border border-white/10 bg-surface/70 p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-accent/20 to-surface border border-accent/30 flex items-center justify-center text-accent font-heading font-bold text-xl shadow-inner shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-heading font-bold text-text-primary">
                        {user.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent font-mono text-xs font-semibold">
                        {user.classRole}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm font-mono text-text-dim mt-1">
                      NIM: <span className="text-text-secondary">{user.nim}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="px-4 py-2 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/40 text-accent text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
                    >
                      <span>⚙️ Panel Sekretaris / Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={() => setShowChangePassModal(true)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary text-xs font-mono transition-all"
                  >
                    🔑 Ubah Sandi
                  </button>
                </div>
              </div>
            </div>

            {/* Active Class Meeting Presensi Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Presensi Perkuliahan Hari Ini
                </h3>
                {activeMeeting && (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Sesi Dibuka
                  </span>
                )}
              </div>

              {activeMeeting ? (
                <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-surface via-surface/80 to-accent/5 p-6 md:p-8 backdrop-blur-md shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Course Details */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/15 border border-accent/20 text-accent text-xs font-mono font-semibold">
                        Pertemuan #{activeMeeting.meetingNumber} &bull; {activeMeeting.date}
                      </div>

                      <h4 className="text-2xl font-heading font-bold text-text-primary">
                        {activeMeeting.courseName}
                      </h4>

                      {activeMeeting.teacherName && (
                        <p className="text-sm text-text-secondary flex items-center gap-2">
                          <span>👨‍🏫 Dosen Pengampu:</span>
                          <strong className="text-text-primary font-medium">{activeMeeting.teacherName}</strong>
                        </p>
                      )}

                      <p className="text-xs font-mono text-text-dim">
                        ⏰ Waktu Perkuliahan: <span className="text-text-primary">{activeMeeting.startTime} - {activeMeeting.endTime} WIB</span>
                      </p>

                      {activeMeeting.topic && (
                        <div className="mt-3 p-3 rounded-xl bg-background/50 border border-white/5 text-xs text-text-secondary">
                          <strong>Materi / Topik:</strong> {activeMeeting.topic}
                        </div>
                      )}
                    </div>

                    {/* Presensi Action / Status */}
                    <div className="bg-background/80 rounded-xl border border-white/10 p-5 flex flex-col items-center text-center justify-center min-h-[160px]">
                      {checkinSuccess && (
                        <div className="mb-3 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg w-full">
                          {checkinSuccess}
                        </div>
                      )}
                      {checkinError && (
                        <div className="mb-3 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg w-full">
                          {checkinError}
                        </div>
                      )}

                      {currentAttendance && currentAttendance.attendanceStatus !== 'BELUM' ? (
                        <div className="space-y-3 w-full">
                          <div className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-heading font-bold text-sm">
                            <span>✅ Terdata: {currentAttendance.attendanceStatus}</span>
                          </div>
                          {currentAttendance.notes && (
                            <p className="text-xs text-text-dim italic">
                              &ldquo;{currentAttendance.notes}&rdquo;
                            </p>
                          )}
                          <p className="text-[11px] font-mono text-text-dim">
                            {currentAttendance.timestamp ? new Date(currentAttendance.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Tercatat'}
                          </p>
                          <div className="pt-2 border-t border-white/5">
                            <span className="text-[11px] text-text-dim">Ingin mengubah status?</span>
                            <div className="flex gap-2 mt-2 justify-center">
                              <button
                                onClick={() => handleCheckin('HADIR')}
                                disabled={checkinLoading}
                                className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono hover:bg-emerald-500/30 transition-colors"
                              >
                                Hadir
                              </button>
                              <button
                                onClick={() => setShowNoteModal('SAKIT')}
                                disabled={checkinLoading}
                                className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-mono hover:bg-amber-500/30 transition-colors"
                              >
                                Sakit
                              </button>
                              <button
                                onClick={() => setShowNoteModal('IZIN')}
                                disabled={checkinLoading}
                                className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-mono hover:bg-sky-500/30 transition-colors"
                              >
                                Izin
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 w-full">
                          <p className="text-xs font-mono text-text-dim mb-1">
                            Silakan lakukan presensi kehadiran:
                          </p>
                          <button
                            onClick={() => handleCheckin('HADIR')}
                            disabled={checkinLoading}
                            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-heading font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                          >
                            <span>👋 Hadir di Kelas</span>
                          </button>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => setShowNoteModal('SAKIT')}
                              disabled={checkinLoading}
                              className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold transition-all"
                            >
                              💊 Sakit
                            </button>
                            <button
                              onClick={() => setShowNoteModal('IZIN')}
                              disabled={checkinLoading}
                              className="py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-mono text-xs font-semibold transition-all"
                            >
                              ✉️ Izin
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/5 bg-surface/50 p-8 text-center backdrop-blur-sm">
                  <div className="text-3xl mb-3">☕</div>
                  <h4 className="text-base font-heading font-semibold text-text-primary">
                    Tidak Ada Sesi Presensi yang Sedang Dibuka
                  </h4>
                  <p className="text-xs md:text-sm text-text-dim max-w-md mx-auto mt-1 leading-relaxed">
                    Sesi presensi akan otomatis muncul ketika Sekretaris atau Komting membuka pertemuan perkuliahan hari ini.
                  </p>
                </div>
              )}
            </div>

            {/* Attendance Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                <div className="col-span-2 md:col-span-1 rounded-2xl border border-accent/20 bg-surface/60 p-4 flex flex-col justify-between backdrop-blur-sm">
                  <span className="text-xs font-mono text-text-dim">Persentase</span>
                  <div className="my-2">
                    <span className="text-3xl font-heading font-bold text-accent">
                      {stats.attendancePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stats.attendancePercentage >= 75 ? 'bg-accent' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(stats.attendancePercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-surface/60 p-4 backdrop-blur-sm">
                  <span className="text-xs font-mono text-emerald-400">Hadir</span>
                  <p className="text-2xl font-heading font-bold text-emerald-400 mt-2">
                    {stats.hadir}
                  </p>
                  <span className="text-[11px] font-mono text-text-dim">Pertemuan</span>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-surface/60 p-4 backdrop-blur-sm">
                  <span className="text-xs font-mono text-amber-400">Sakit</span>
                  <p className="text-2xl font-heading font-bold text-amber-400 mt-2">
                    {stats.sakit}
                  </p>
                  <span className="text-[11px] font-mono text-text-dim">Pertemuan</span>
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-surface/60 p-4 backdrop-blur-sm">
                  <span className="text-xs font-mono text-sky-400">Izin</span>
                  <p className="text-2xl font-heading font-bold text-sky-400 mt-2">
                    {stats.izin}
                  </p>
                  <span className="text-[11px] font-mono text-text-dim">Pertemuan</span>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-surface/60 p-4 backdrop-blur-sm">
                  <span className="text-xs font-mono text-red-400">Alpa / Tanpa Ket.</span>
                  <p className="text-2xl font-heading font-bold text-red-400 mt-2">
                    {stats.alpa}
                  </p>
                  <span className="text-[11px] font-mono text-text-dim">Pertemuan</span>
                </div>
              </div>
            )}

            {/* Attendance History Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-bold text-text-primary">
                Riwayat Presensi Kamu
              </h3>

              {history.length > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-surface/60 overflow-hidden backdrop-blur-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 border-b border-white/10 text-xs font-mono text-text-dim uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5">Mata Kuliah</th>
                          <th className="px-5 py-3.5">Pertemuan</th>
                          <th className="px-5 py-3.5">Tanggal & Waktu</th>
                          <th className="px-5 py-3.5">Status Presensi</th>
                          <th className="px-5 py-3.5">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {history.map((item) => {
                          const badgeColors: Record<string, string> = {
                            HADIR: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
                            SAKIT: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
                            IZIN: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
                            ALPA: 'bg-red-500/15 border-red-500/30 text-red-400',
                            BELUM: 'bg-white/10 border-white/20 text-text-dim',
                          };

                          return (
                            <tr key={item.meetingId} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-5 py-4 font-medium text-text-primary">
                                {item.courseName}
                              </td>
                              <td className="px-5 py-4 font-mono text-xs text-text-secondary">
                                #{item.meetingNumber}
                              </td>
                              <td className="px-5 py-4 font-mono text-xs text-text-dim">
                                {item.date} &bull; {item.startTime}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${
                                    badgeColors[item.attendanceStatus] || badgeColors.BELUM
                                  }`}
                                >
                                  {item.attendanceStatus === 'BELUM' ? 'Belum Absen' : item.attendanceStatus}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs text-text-dim italic">
                                {item.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/5 bg-surface/30 p-8 text-center text-xs font-mono text-text-dim">
                  Belum ada rekaman riwayat presensi yang tersedia.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Sakit / Izin Note */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-heading font-bold text-text-primary">
              Keterangan Presensi [{showNoteModal}]
            </h4>
            <p className="text-xs text-text-dim">
              Tuliskan alasan atau keterangan singkat (opsional):
            </p>
            <textarea
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
              placeholder="Misal: Demam tinggi, izin keperluan keluarga, dll..."
              rows={3}
              className="w-full p-3 rounded-xl bg-background/80 border border-white/10 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setShowNoteModal(null);
                  setSelectedNote('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono text-text-dim hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleCheckin(showNoteModal, selectedNote)}
                disabled={checkinLoading}
                className="px-4 py-2 rounded-xl bg-accent text-background font-mono text-xs font-bold hover:bg-accent-hover transition-colors"
              >
                Kirim Presensi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Change Password */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-heading font-bold text-text-primary">
              🔑 Ganti Password Akun
            </h4>

            {passError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                {passSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Password lama"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-white/10 text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-white/10 text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-white/10 text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-text-dim hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-4 py-2 rounded-xl bg-accent text-background font-mono text-xs font-bold hover:bg-accent-hover transition-colors disabled:opacity-60"
                >
                  {passLoading ? 'Menyimpan...' : 'Simpan Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
