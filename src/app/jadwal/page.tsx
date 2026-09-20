'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, BookOpen, User, ChevronRight, ArrowLeft, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

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

const days = [
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
  { id: 6, name: 'Sabtu' }
];

export default function JadwalPage() {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<number>(1);

  useEffect(() => {
    // Auto-select today
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
    if (today >= 1 && today <= 6) {
      setActiveDay(today);
    } else {
      setActiveDay(1); // Default to Monday if Sunday
    }

    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/absensi/schedules');
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error('Gagal memuat jadwal', err);
    } finally {
      setIsLoading(false);
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

  const currentSchedules = groupedSchedules.get(activeDay) || [];

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden pb-20 selection:bg-accent/30 selection:text-accent-hover">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-accent/20 rounded-full blur-[120px] mix-blend-screen animate-float opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen animate-float-delayed opacity-50" />
        <div className="absolute inset-0 bg-noise opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-12 md:pt-24">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors group">
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-accent/20 group-hover:border-accent/30 group-hover:text-accent transition-all">
              <ArrowLeft size={16} />
            </div>
            <span className="font-mono text-sm uppercase tracking-widest font-semibold">Kembali ke Utama</span>
          </Link>
          <div className="flex items-center gap-2 text-text-muted">
            <Calendar size={18} />
            <span className="font-mono text-xs uppercase tracking-widest font-semibold">T.A. 2026/2027</span>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} />
            <span>Class F Daily Schedule</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-heading font-black leading-tight tracking-tight mb-6">
            Jadwal <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-hover to-accent">
              Perkuliahan
            </span>
          </h1>
          
          <p className="text-text-secondary text-lg md:text-xl font-body max-w-2xl mx-auto md:mx-0">
            Jadwal kelas mingguan mahasiswa Teknik Komputer F Angkatan 2025. 
            Semoga harimu penuh logika dan minim error.
          </p>
        </motion.div>

        {/* Day Selector */}
        <div className="sticky top-4 z-50 mb-12 rounded-2xl bg-surface/80 border border-white/10 backdrop-blur-md p-2 shadow-2xl flex items-center justify-between md:justify-start gap-2 overflow-x-auto custom-scrollbar">
          {days.filter(d => groupedSchedules.get(d.id)?.length! > 0 || d.id !== 6).map(day => (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={`whitespace-nowrap px-5 py-3 rounded-xl font-heading font-bold text-sm transition-all flex-1 md:flex-none text-center ${
                activeDay === day.id
                  ? 'bg-accent text-background shadow-lg shadow-accent/20'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>

        {/* Timeline List */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/0 via-accent/20 to-accent/0 hidden md:block" />

          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <RefreshCw className="animate-spin text-accent mb-4" size={32} />
              <p className="font-mono text-text-dim uppercase tracking-widest text-sm">Menyelaraskan Jadwal...</p>
            </div>
          ) : currentSchedules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/5"
            >
              <Calendar className="mx-auto text-white/20 mb-4" size={48} />
              <h3 className="text-xl font-heading font-bold text-text-primary mb-2">Tidak Ada Jadwal</h3>
              <p className="text-text-dim font-mono text-sm">Silakan gunakan waktumu untuk istirahat atau ngoding santai.</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentSchedules.map((slot, idx) => (
                  <div key={slot.id} className="relative flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center group">
                    {/* Time indicator (Left on desktop) */}
                    <div className="md:w-32 shrink-0 flex items-center md:justify-end gap-3 md:pt-0 pt-2 relative z-10">
                      <div className="flex flex-row md:flex-col items-center md:items-end gap-1.5 md:gap-0">
                        <span className="font-heading font-black text-xl md:text-3xl text-white tracking-tighter">
                          {slot.startTime}
                        </span>
                        <span className="font-mono text-xs text-text-dim flex items-center gap-1 uppercase">
                          s/d {slot.endTime}
                        </span>
                      </div>
                      {/* Timeline Dot */}
                      <div className="hidden md:flex absolute -right-3 w-6 h-6 rounded-full bg-background border-[4px] border-accent/20 items-center justify-center group-hover:border-accent group-hover:scale-125 transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 w-full rounded-2xl border border-white/10 bg-surface/50 backdrop-blur-sm p-5 md:p-7 hover:bg-surface/80 hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 shadow-xl group-hover:shadow-accent/5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 group-hover:to-accent-hover transition-colors">
                          {slot.courseName}
                        </h2>
                        
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent font-mono text-xs font-bold shrink-0 self-start">
                          <Clock size={14} />
                          Les ke-{slot.order}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-text-secondary border-t border-white/5 pt-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <User size={18} className="text-text-muted" />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-0.5">Dosen Pengampu</p>
                          <p className="font-heading font-semibold text-white/90 text-sm md:text-base">{slot.teacherName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
