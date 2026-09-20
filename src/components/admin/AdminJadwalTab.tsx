'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Calendar, Save, X, RefreshCw, Clock, BookOpen, User, CheckCircle2 } from 'lucide-react';

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

const DEFAULT_PASSKEY = 'cef2024';

function getActiveApiKey(): string {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('cef_admin_passkey') || DEFAULT_PASSKEY;
  }
  return DEFAULT_PASSKEY;
}

export default function AdminJadwalTab() {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<ScheduleSlot>>({
    dayOfWeek: 1,
    dayName: 'Senin',
    order: 1,
    courseName: '',
    teacherName: '',
    startTime: '07:30',
    endTime: '08:20'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const days = [
    { id: 1, name: 'Senin' },
    { id: 2, name: 'Selasa' },
    { id: 3, name: 'Rabu' },
    { id: 4, name: 'Kamis' },
    { id: 5, name: 'Jumat' },
    { id: 6, name: 'Sabtu' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  function showMessage(type: 'success' | 'error', text: string) {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  }

  async function loadData() {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/absensi/schedules', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules || []);
      } else {
        showMessage('error', data.error || 'Gagal memuat jadwal');
      }
    } catch {
      showMessage('error', 'Koneksi error saat memuat jadwal');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  const groupedSchedules = useMemo(() => {
    const grouped = new Map<number, ScheduleSlot[]>();
    days.forEach(d => grouped.set(d.id, []));
    schedules.forEach(s => {
      if (!grouped.has(s.dayOfWeek)) grouped.set(s.dayOfWeek, []);
      grouped.get(s.dayOfWeek)!.push(s);
    });
    // Sort each day by order/startTime
    grouped.forEach(list => {
      list.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.startTime.localeCompare(b.startTime);
      });
    });
    return grouped;
  }, [schedules]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      dayOfWeek: 1,
      dayName: 'Senin',
      order: 1,
      courseName: '',
      teacherName: '',
      startTime: '07:30',
      endTime: '08:20'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slot: ScheduleSlot) => {
    setEditingId(slot.id);
    setFormData({ ...slot });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseName || !formData.teacherName) {
      showMessage('error', 'Semua field wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const apiKey = getActiveApiKey();
      const url = '/api/absensi/schedules';
      const method = editingId ? 'PUT' : 'POST';
      const body = {
        ...formData,
        id: editingId,
        dayName: days.find(d => d.id === Number(formData.dayOfWeek))?.name || 'Senin'
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (data.success) {
        showMessage('success', editingId ? 'Jadwal diperbarui' : 'Jadwal ditambahkan');
        setIsModalOpen(false);
        setSchedules(data.schedules);
      } else {
        showMessage('error', data.error || 'Gagal menyimpan');
      }
    } catch {
      showMessage('error', 'Terjadi kesalahan jaringan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const apiKey = getActiveApiKey();
      const res = await fetch(`/api/absensi/schedules?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', 'Jadwal dihapus');
        setSchedules(data.schedules);
      } else {
        showMessage('error', data.error || 'Gagal menghapus');
      }
    } catch {
      showMessage('error', 'Koneksi error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-text-dim animate-pulse">Memuat Jadwal...</div>;
  }

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-mono border flex items-center justify-between shadow-lg transition-all ${
          statusMessage.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            <span>{statusMessage.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-surface/70 p-5 md:p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
            <Calendar size={18} />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-text-primary">Jadwal Kuliah</h2>
            <p className="text-xs text-text-dim mt-0.5">Kelola jadwal mata kuliah mingguan kelas F</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover active:scale-95 text-background font-heading font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-accent/20 transition-all flex-1 md:flex-none justify-center"
          >
            <Plus size={14} />
            <span>Tambah Jadwal</span>
          </button>
          
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {days.map(day => {
          const daySchedules = groupedSchedules.get(day.id) || [];
          if (daySchedules.length === 0 && day.id === 6) return null; // Hide Saturday if empty
          
          return (
            <div key={day.id} className="rounded-2xl border border-white/10 bg-surface/40 flex flex-col overflow-hidden">
              <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-text-primary">{day.name}</h3>
                <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                  {daySchedules.length} Sesi
                </span>
              </div>
              
              <div className="p-3 space-y-2.5 flex-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                {daySchedules.length === 0 ? (
                  <div className="text-center py-8 text-xs font-mono text-text-dim italic">
                    Tidak ada jadwal
                  </div>
                ) : (
                  daySchedules.map((slot) => (
                    <div key={slot.id} className="group relative rounded-xl border border-white/5 bg-background/50 hover:bg-background/80 hover:border-white/10 transition-all p-3 shadow-sm hover:shadow-md">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-1.5 text-accent text-xs font-mono font-medium bg-accent/10 w-fit px-2 py-0.5 rounded-md mb-1.5">
                          <Clock size={12} />
                          {slot.startTime} - {slot.endTime}
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button onClick={() => openEditModal(slot)} className="p-1.5 rounded-md text-text-dim hover:text-white hover:bg-white/10 transition-colors">
                            <Edit2 size={12} />
                          </button>
                          {confirmDeleteId === slot.id ? (
                            <div className="flex items-center gap-1 bg-red-500/20 rounded-md border border-red-500/30">
                              <button onClick={() => handleDelete(slot.id)} className="p-1.5 text-red-400 hover:text-red-300">
                                <CheckCircle2 size={12} />
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} className="p-1.5 text-text-dim hover:text-white">
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(slot.id)} className="p-1.5 rounded-md text-text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="font-heading font-semibold text-sm text-text-primary mb-1 flex items-start gap-1.5">
                        <BookOpen size={14} className="mt-0.5 text-emerald-400 shrink-0" />
                        <span className="leading-tight">{slot.courseName}</span>
                      </h4>
                      <p className="text-[11px] font-mono text-text-dim flex items-center gap-1.5">
                        <User size={12} />
                        <span className="truncate">{slot.teacherName}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                {editingId ? <Edit2 size={18} className="text-accent" /> : <Plus size={18} className="text-accent" />}
                {editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-dim hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-text-dim">Hari</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                  >
                    {days.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-text-dim">Urutan (Les Ke-)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-dim">Mata Kuliah</label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  placeholder="Contoh: Pemrograman Web"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-dim">Dosen Pengampu</label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="Nama beserta gelar"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-text-dim">Jam Mulai</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-text-dim">Jam Selesai</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-accent hover:bg-accent-hover text-background font-bold text-sm flex items-center gap-2 shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {editingId ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
