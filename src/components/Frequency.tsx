'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Music,
  Sparkles,
  ExternalLink,
  Disc,
  Headphones,
  Quote,
  ListMusic,
} from 'lucide-react';
import SectionReveal from './SectionReveal';
import type { Song } from '@/types';

export default function Frequency() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'playlist'>('player');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch playlist songs from API
  useEffect(() => {
    async function loadSongs() {
      try {
        const res = await fetch('/api/songs');
        const data = await res.json();
        if (data.songs && data.songs.length > 0) {
          setSongs(data.songs);
        }
      } catch (err) {
        console.error('Failed to load songs:', err);
      }
    }
    loadSongs();
  }, []);

  const currentSong = songs[currentIndex] || null;

  // Handle Play / Pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong?.audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio play prevented:', err);
          setIsPlaying(false);
        });
    }
  }, [isPlaying, currentSong]);

  // Next Track
  const handleNext = useCallback(() => {
    if (songs.length === 0) return;
    const nextIdx = (currentIndex + 1) % songs.length;
    setCurrentIndex(nextIdx);
    setIsPlaying(true);
  }, [currentIndex, songs.length]);

  // Prev Track
  const handlePrev = useCallback(() => {
    if (songs.length === 0) return;
    const prevIdx = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentIndex(prevIdx);
    setIsPlaying(true);
  }, [currentIndex, songs.length]);

  // Select song from playlist
  const selectSong = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isLooping, handleNext]);

  // Synchronize audio source when current song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong?.audioUrl) {
      audio.src = currentSong.audioUrl;
      audio.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
    setCurrentTime(0);
  }, [currentSong, isPlaying, isMuted, volume]);

  // Scrub / Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section id="frequency" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Cybernetic Glow */}
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hidden HTML5 Audio Element */}
      <audio ref={audioRef} preload="auto" />

      <div className="container-custom relative z-10">
        <SectionReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-xs mb-3">
                <Headphones size={13} />
                <span>THE FREQUENCY — CLASS SOUNDTRACK</span>
              </div>
              <h2 className="text-fluid-heading font-heading font-bold text-text-primary">
                Soundtrack Perjalanan &amp; <span className="text-accent">Begadang Kelas F</span>
              </h2>
              <p className="text-fluid-body text-text-muted max-w-2xl mt-2 leading-relaxed">
                Lagu-lagu pilihan yang menemani pengerjaan modul praktikum, begadang debug code, karaoke kelas, hingga perjalanan pulang santai anak Teknik Komputer F.
              </p>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-elevated border border-border shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('player')}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'player'
                    ? 'bg-accent text-bg-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Disc size={13} />
                <span>Now Playing</span>
              </button>
              <button
                onClick={() => setActiveTab('playlist')}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'playlist'
                    ? 'bg-accent text-bg-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <ListMusic size={13} />
                <span>Playlist ({songs.length})</span>
              </button>
            </div>
          </div>
        </SectionReveal>

        {songs.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-bg-elevated/20 p-8 flex flex-col items-center justify-center">
            <Music size={36} className="text-text-dim mb-3 animate-pulse" />
            <p className="text-sm font-heading font-semibold text-text-primary">
              Playlist sedang disinkronkan...
            </p>
            <p className="text-xs text-text-muted mt-1">
              Tambahkan lagu pertama melalui Admin Console (/admin).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT / CENTER: THE MAIN AUDIO DECK (7 Cols) */}
            <div
              className={`lg:col-span-7 ${
                activeTab === 'playlist' ? 'hidden lg:block' : 'block'
              }`}
            >
              <div className="relative rounded-3xl border border-border bg-bg-elevated/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl overflow-hidden">
                {/* Subtle gradient glow behind vinyl */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-accent/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  {/* Spinning Vinyl / Album Art Disc */}
                  <div className="relative group shrink-0">
                    <div
                      className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2 border-2 border-border/80 bg-black/90 shadow-2xl transition-all duration-700 flex items-center justify-center ${
                        isPlaying ? 'shadow-[0_0_40px_rgba(0,240,255,0.25)] border-accent/50' : ''
                      }`}
                    >
                      {/* Grooves on vinyl */}
                      <div className="absolute inset-3 rounded-full border border-white/5 pointer-events-none" />
                      <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
                      <div className="absolute inset-9 rounded-full border border-white/5 pointer-events-none" />

                      {/* Rotating Center Art */}
                      <div
                        className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-black/80 shadow-inner select-none ${
                          isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
                        }`}
                      >
                        {currentSong?.coverUrl ? (
                          <img
                            src={currentSong.coverUrl}
                            alt={currentSong.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-accent/20 to-purple-500/20 flex items-center justify-center text-accent">
                            <Music size={32} />
                          </div>
                        )}
                      </div>

                      {/* Center Spindle Hole */}
                      <div className="absolute w-5 h-5 rounded-full bg-bg-elevated border-2 border-white/20 z-10" />
                    </div>

                    {/* Badge Category on Disc */}
                    {currentSong?.category && (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-bg-surface border border-border text-[10px] font-mono text-accent shadow-md whitespace-nowrap">
                        {currentSong.category}
                      </span>
                    )}
                  </div>

                  {/* Track Metadata & Equalizer */}
                  <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                    {/* Contributor Chip */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-surface border border-border mb-3">
                      <div className="w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[9px] font-bold">
                        {currentSong?.suggestedBy?.charAt(0) || 'F'}
                      </div>
                      <span className="text-[11px] font-mono text-text-muted">
                        Dipilih oleh: <strong className="text-text-primary">{currentSong?.suggestedBy || 'Kelas F'}</strong>
                      </span>
                    </div>

                    {/* Title & Artist */}
                    <h3 className="text-xl sm:text-2xl font-heading font-bold text-text-primary truncate">
                      {currentSong?.title}
                    </h3>
                    <p className="text-sm font-mono text-accent truncate mt-0.5">
                      {currentSong?.artist}
                    </p>
                    {currentSong?.album && (
                      <p className="text-xs text-text-dim truncate mt-0.5">
                        Album: {currentSong.album}
                      </p>
                    )}

                    {/* Animated Sound Wave Equalizer */}
                    <div className="flex items-center justify-center sm:justify-start gap-1 h-6 my-4">
                      {[14, 22, 12, 28, 16, 24, 10, 26, 18, 14, 22, 16].map((h, i) => (
                        <motion.span
                          key={i}
                          className="w-1 rounded-full bg-gradient-to-t from-accent/50 to-accent"
                          animate={{
                            height: isPlaying ? [4, h, 6, h * 0.8, 4] : 4,
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            delay: i * 0.06,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                      <span className="text-[10px] font-mono text-text-dim ml-2 uppercase">
                        {isPlaying ? 'Audio Active' : 'Paused'}
                      </span>
                    </div>

                    {/* Note / Quote if provided */}
                    {currentSong?.note && (
                      <div className="p-3 rounded-xl bg-bg-surface/60 border border-border/60 text-xs text-text-muted flex items-start gap-2 italic leading-relaxed">
                        <Quote size={13} className="text-accent shrink-0 mt-0.5" />
                        <span>&ldquo;{currentSong.note}&rdquo;</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrubber / Timeline Progress */}
                <div className="mt-8">
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-dim mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-accent font-semibold">Official 30s Preview</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 30}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                {/* Audio Controls */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
                  {/* Left: Loop & Streaming Links */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isLooping
                          ? 'bg-accent/20 border-accent text-accent'
                          : 'border-border text-text-dim hover:text-text-primary'
                      }`}
                      title={isLooping ? 'Ulangi Lagu Aktif' : 'Ulangi Lagu Nonaktif'}
                    >
                      <Repeat size={15} />
                    </button>

                    {currentSong?.spotifyUrl && (
                      <a
                        href={currentSong.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono transition-colors flex items-center gap-1.5"
                        title="Buka di Spotify"
                      >
                        <ExternalLink size={12} />
                        <span>Spotify</span>
                      </a>
                    )}
                  </div>

                  {/* Center: Prev, Play/Pause, Next */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrev}
                      className="p-3 rounded-2xl border border-border bg-bg-surface hover:border-accent/40 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      title="Lagu Sebelumnya"
                    >
                      <SkipBack size={18} />
                    </button>

                    <button
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-2xl bg-accent hover:bg-accent/90 text-bg-primary flex items-center justify-center transition-all cursor-pointer shadow-[0_0_25px_rgba(0,240,255,0.35)] hover:scale-105 active:scale-95"
                      title={isPlaying ? 'Jeda' : 'Putar Musik'}
                    >
                      {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                    </button>

                    <button
                      onClick={handleNext}
                      className="p-3 rounded-2xl border border-border bg-bg-surface hover:border-accent/40 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      title="Lagu Berikutnya"
                    >
                      <SkipForward size={18} />
                    </button>
                  </div>

                  {/* Right: Volume Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                    >
                      {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-20 h-1.5 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: PLAYLIST QUEUE DRAWER (5 Cols) */}
            <div
              className={`lg:col-span-5 ${
                activeTab === 'player' ? 'hidden lg:block' : 'block'
              }`}
            >
              <div className="rounded-3xl border border-border bg-bg-elevated/40 backdrop-blur-md p-5 sm:p-6 flex flex-col h-[520px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ListMusic size={16} className="text-accent" />
                    <h3 className="text-sm font-heading font-bold text-text-primary">
                      Antrian Playlist Kelas
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-text-dim">
                    {songs.length} Track Pilihan
                  </span>
                </div>

                {/* Scrollable Song List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {songs.map((song, index) => {
                    const isSelected = index === currentIndex;
                    return (
                      <div
                        key={song.id}
                        onClick={() => selectSong(index)}
                        className={`group p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-accent/10 border-accent/60 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                            : 'bg-bg-surface/50 border-border/70 hover:border-accent/30 hover:bg-bg-surface'
                        }`}
                      >
                        {/* Cover Thumbnail */}
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black shrink-0 border border-border/50">
                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              {isPlaying ? (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                  className="w-2 h-2 rounded-full bg-accent"
                                />
                              ) : (
                                <Play size={14} className="text-white fill-white ml-0.5" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4
                              className={`text-xs font-heading font-semibold truncate ${
                                isSelected ? 'text-accent' : 'text-text-primary group-hover:text-accent'
                              }`}
                            >
                              {song.title}
                            </h4>
                          </div>
                          <p className="text-[11px] font-mono text-text-muted truncate">
                            {song.artist}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-text-dim truncate">
                              Oleh: {song.suggestedBy}
                            </span>
                            {song.category && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-bg-surface border border-border text-text-dim">
                                {song.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Play Indicator / Button */}
                        <div className="shrink-0 text-text-dim group-hover:text-accent">
                          {isSelected && isPlaying ? (
                            <div className="flex items-end gap-0.5 h-3.5">
                              <span className="w-0.5 h-3 bg-accent animate-pulse" />
                              <span className="w-0.5 h-2 bg-accent animate-bounce" />
                              <span className="w-0.5 h-3.5 bg-accent animate-pulse" />
                            </div>
                          ) : (
                            <Play size={13} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Playlist Footer Note */}
                <div className="pt-3 mt-3 border-t border-border/50 text-center">
                  <p className="text-[10px] font-mono text-text-dim">
                    Ingin menambahkan lagu favoritmu? Hubungi Ronn atau kurator kelas!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
