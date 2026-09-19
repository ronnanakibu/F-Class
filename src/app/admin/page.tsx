'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Trash2,
  Save,
  Plus,
  RefreshCw,
  Search,
  Check,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  FileCode,
  Users,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Calendar,
  ClipboardList,
  FolderArchive,
  X,
  ExternalLink,
  ShieldCheck,
  Crop as CropIcon,
  Video,
  Play,
  Pause,
  MessageSquare,
  Pencil,
  Clock,
  FolderGit2,
  Star,
  Globe,
  Tag,
  Music,
  Headphones,
  Layers,
  ChevronUp,
  ChevronDown,
  Download,
  Copy,
  Scissors,
  FileAudio,
  Bot,
  Radio,
} from 'lucide-react';
import { getInitials, stringToHue } from '@/lib/utils';
import ImageCropperModal from '@/components/ImageCropperModal';
import AdminAbsensiTab from '@/components/admin/AdminAbsensiTab';
import type { IGStory, Project, Song, SlideItem } from '@/types';

interface Student {
  id: number | string;
  name: string;
  nim: string;
  alias?: string;
  role?: string;
  instagram?: string;
  katakata?: string;
  photo?: string;
  quote?: string;
  nickname?: string;
}

const DEFAULT_PASSKEY = 'cef2024';

function getActiveApiKey(): string {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('cef_admin_passkey') || DEFAULT_PASSKEY;
  }
  return DEFAULT_PASSKEY;
}

export default function AdminPage() {
  // Authentication & Easter Egg State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Core Data
  const [students, setStudents] = useState<Student[]>([]);
  const [rawJson, setRawJson] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Active Tab: Unified Section Structure
  const [activeTab, setActiveTab] = useState<'students' | 'journey' | 'projects' | 'music' | 'stories' | 'godmode' | 'absensi' | 'roadmap'>('students');
  // Student Sub-tabs: 'identity' (Form) | 'photos' (Foto Profil) | 'json' (Raw Code)
  const [studentSubTab, setStudentSubTab] = useState<'identity' | 'photos' | 'json'>('identity');

  // Journey Showcase State
  const [adminSlides, setAdminSlides] = useState<SlideItem[]>([]);
  const [isLoadingSlides, setIsLoadingSlides] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);
  const [isCreatingNewSlide, setIsCreatingNewSlide] = useState(false);
  const [isSavingSlide, setIsSavingSlide] = useState(false);

  // Slide Form State
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideTag, setSlideTag] = useState('Orientation');
  const [slideSemester, setSlideSemester] = useState<number>(1);
  const [slideDate, setSlideDate] = useState('');
  const [slideDescription, setSlideDescription] = useState('');
  const [slideMediaUrl, setSlideMediaUrl] = useState('');
  const [slideMediaType, setSlideMediaType] = useState<'image' | 'video'>('image');
  const [slideAccentColor, setSlideAccentColor] = useState('#3b82f6');

  // God Mode (Website Content) State
  const [godHero, setGodHero] = useState({
    headlinePart1: 'KELAS YANG ISINYA',
    headlinePart2: 'LITTLE LITTLE GAGAP.',
    subtitle: 'Computer Engineering — Class F',
    badgeCode: 'CE — F',
    badgeLabel: 'TK-F POLMED',
    mockupImage: '/hero-mockup.jpg',
  });
  const [godManifesto, setGodManifesto] = useState({
    tagline: 'Circuits, Code, and Chaos.',
    quote: 'Setiap gerbang logika yang kami susun, setiap baris kode yang kami debug hingga dini hari—adalah bukti bahwa kami bukan sekadar belajar teknologi, kami membentuk masa depan.',
    description: 'Kami adalah kelas F dari Program Studi Teknik Komputer Politeknik Negeri Medan, Angkatan 2025. Datang dari berbagai daerah dan disatukan di sini, kami punya satu tujuan: belajar bertumbuh, dan merintis jalan menuju masa depan yang kami impikan.',
    statProjects: 12,
    statHours: 1440,
  });
  const [godFooter, setGodFooter] = useState({
    tagline: 'Circuits, Code, and Chaos.',
    copyright: 'Class F — Computer Engineering POLMED 2025',
    instagramUrl: 'https://instagram.com/comeinone.f',
  });
  const [isLoadingGodMode, setIsLoadingGodMode] = useState(false);
  const [isSavingGodMode, setIsSavingGodMode] = useState(false);

  // Projects State
  const [adminProjects, setAdminProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('All');

  // Project Form State
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Web Development');
  const [projDescription, setProjDescription] = useState('');
  const [projTechStack, setProjTechStack] = useState('');
  const [projTeam, setProjTeam] = useState('');
  const [projRepoUrl, setProjRepoUrl] = useState('');
  const [projDemoUrl, setProjDemoUrl] = useState('');
  const [projImage, setProjImage] = useState('');
  const [projFeatured, setProjFeatured] = useState(false);

  // Songs Playlist State
  const [adminSongs, setAdminSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isCreatingNewSong, setIsCreatingNewSong] = useState(false);
  const [isSavingSong, setIsSavingSong] = useState(false);
  const [songSearch, setSongSearch] = useState('');
  const [songCategoryFilter, setSongCategoryFilter] = useState('All');
  const [adminPlayingAudioId, setAdminPlayingAudioId] = useState<string | null>(null);
  const adminAudioRef = useRef<HTMLAudioElement | null>(null);

  // Music Auto-Search & Provider State
  const [musicSearchProvider, setMusicSearchProvider] = useState<'itunes' | 'youtube' | 'upload'>('itunes');
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [musicSearchResults, setMusicSearchResults] = useState<any[]>([]);
  const [selectedYtTrack, setSelectedYtTrack] = useState<any | null>(null);
  const [ytStartSecond, setYtStartSecond] = useState<number>(60);
  const [isTrimmingAudio, setIsTrimmingAudio] = useState(false);
  const [trimFeedback, setTrimFeedback] = useState<string | null>(null);

  // Audio Preview State (YouTube Trimmer)
  const [isYtPreviewPlaying, setIsYtPreviewPlaying] = useState(false);
  const [ytPreviewElapsed, setYtPreviewElapsed] = useState(0); // seconds 0-30
  const [ytPreviewKey, setYtPreviewKey] = useState(0); // forces iframe reload
  const ytPreviewTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Bot Endpoint State
  const [useBotEndpoint, setUseBotEndpoint] = useState<boolean>(false);
  const [botEndpointUrl, setBotEndpointUrl] = useState<string>('http://ap1.nzb.zelpstore.id:25637');
  const [isTestingBotPing, setIsTestingBotPing] = useState<boolean>(false);
  const [botPingStatus, setBotPingStatus] = useState<'idle' | 'online' | 'offline'>('idle');
  const [botPingLatency, setBotPingLatency] = useState<number | null>(null);
  const [botPingMessage, setBotPingMessage] = useState<string | null>(null);

  // Song Form State
  const [formSongTitle, setFormSongTitle] = useState('');
  const [formSongArtist, setFormSongArtist] = useState('');
  const [formSongAlbum, setFormSongAlbum] = useState('');
  const [formSongCoverUrl, setFormSongCoverUrl] = useState('');
  const [formSongAudioUrl, setFormSongAudioUrl] = useState('');
  const [formSongSpotifyUrl, setFormSongSpotifyUrl] = useState('');
  const [formSongAppleMusicUrl, setFormSongAppleMusicUrl] = useState('');
  const [formSongSuggestedBy, setFormSongSuggestedBy] = useState('Lagu Kebangsaan Kelas F');
  const [formSongNote, setFormSongNote] = useState('');
  const [formSongCategory, setFormSongCategory] = useState('Class Anthem');

  // Stories State
  const [stories, setStories] = useState<IGStory[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [storyDate, setStoryDate] = useState('');
  const [storyCategory, setStoryCategory] = useState('General');
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [storyDragOver, setStoryDragOver] = useState(false);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  // Story Edit Metadata State
  const [editingStory, setEditingStory] = useState<IGStory | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editTimestamp, setEditTimestamp] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCategory, setEditCategory] = useState('General');
  const [editMediaType, setEditMediaType] = useState<'image' | 'video'>('image');
  const [isSavingStoryMeta, setIsSavingStoryMeta] = useState(false);

  // Inline non-blocking delete confirmation states (prevents INP blocking)
  const [confirmDeleteSongId, setConfirmDeleteSongId] = useState<string | null>(null);
  const [confirmDeleteProjId, setConfirmDeleteProjId] = useState<string | null>(null);
  const [confirmDeleteSlideId, setConfirmDeleteSlideId] = useState<string | null>(null);
  const [confirmDeleteStoryId, setConfirmDeleteStoryId] = useState<string | null>(null);
  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<number | string | null>(null);
  const [confirmDeletePhotoId, setConfirmDeletePhotoId] = useState<number | string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Drag & Drop State
  const [isBatchDragging, setIsBatchDragging] = useState(false);
  const [draggingCardId, setDraggingCardId] = useState<string | number | null>(null);
  const [isModalDragging, setIsModalDragging] = useState(false);
  const batchInputRef = useRef<HTMLInputElement>(null);

  // Modal State for Photo Upload
  const [activePhotoStudent, setActivePhotoStudent] = useState<Student | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper Modal State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  const [cropperStudent, setCropperStudent] = useState<Student | null>(null);

  // Modal State for Student Form (Add / Edit)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Check auth session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('cef_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch student data from API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/students', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStudents(json.data);
        setRawJson(JSON.stringify(json.data, null, 4));
      } else {
        showToast('Gagal memuat data mahasiswa', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat memuat data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Fetch stories data from API
  const loadStories = useCallback(async () => {
    setIsLoadingStories(true);
    try {
      const res = await fetch('/api/stories', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.stories)) {
        setStories(json.stories);
      }
    } catch {
      showToast('Gagal memuat data story', 'error');
    } finally {
      setIsLoadingStories(false);
    }
  }, [showToast]);

  // Fetch projects data from API
  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.projects)) {
        setAdminProjects(json.projects);
      }
    } catch {
      showToast('Gagal memuat data proyek', 'error');
    } finally {
      setIsLoadingProjects(false);
    }
  }, [showToast]);

  // Fetch songs playlist from API
  const loadSongs = useCallback(async () => {
    setIsLoadingSongs(true);
    try {
      const res = await fetch('/api/songs', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.songs)) {
        setAdminSongs(json.songs);
      }
    } catch {
      showToast('Gagal memuat playlist lagu', 'error');
    } finally {
      setIsLoadingSongs(false);
    }
  }, [showToast]);

  // Fetch journey slides from API
  const loadSlides = useCallback(async () => {
    setIsLoadingSlides(true);
    try {
      const res = await fetch('/api/journey', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.slides)) {
        setAdminSlides(json.slides);
      }
    } catch {
      showToast('Gagal memuat daftar slide The Journey', 'error');
    } finally {
      setIsLoadingSlides(false);
    }
  }, [showToast]);

  // Fetch God Mode site content from API
  const loadGodContent = useCallback(async () => {
    setIsLoadingGodMode(true);
    try {
      const res = await fetch('/api/site-content', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.content) {
        if (json.content.hero) setGodHero((prev) => ({ ...prev, ...json.content.hero }));
        if (json.content.manifesto) setGodManifesto((prev) => ({ ...prev, ...json.content.manifesto }));
        if (json.content.footer) setGodFooter((prev) => ({ ...prev, ...json.content.footer }));
      }
    } catch {
      showToast('Gagal memuat konten website', 'error');
    } finally {
      setIsLoadingGodMode(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadStories();
      loadProjects();
      loadSongs();
      loadSlides();
      loadGodContent();
    }
  }, [isAuthenticated, loadData, loadStories, loadProjects, loadSongs, loadSlides, loadGodContent]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUse = localStorage.getItem('cef_use_bot_endpoint');
      if (savedUse !== null) {
        setUseBotEndpoint(savedUse === 'true');
      }
      const savedUrl = localStorage.getItem('cef_bot_endpoint');
      if (savedUrl) {
        setBotEndpointUrl(savedUrl);
      }
    }
  }, []);

  const handleToggleBotEndpoint = (val: boolean) => {
    setUseBotEndpoint(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cef_use_bot_endpoint', String(val));
    }
  };

  const handleUpdateBotUrl = (url: string) => {
    setBotEndpointUrl(url);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cef_bot_endpoint', url);
    }
    setBotPingStatus('idle');
    setBotPingMessage(null);
  };

  const handleTestBotPing = async () => {
    if (!botEndpointUrl.trim()) {
      showToast('Masukkan URL Bot Endpoint terlebih dahulu', 'error');
      return;
    }
    setIsTestingBotPing(true);
    setBotPingStatus('idle');
    setBotPingMessage(null);

    try {
      const res = await fetch(`/api/music/ping?endpoint=${encodeURIComponent(botEndpointUrl.trim())}`);
      const data = await res.json();
      if (data.online) {
        setBotPingStatus('online');
        setBotPingLatency(data.latency);
        setBotPingMessage(`Online (${data.latency}ms)`);
        showToast(`Bot Endpoint aktif! Respons dalam ${data.latency}ms`, 'success');
      } else {
        setBotPingStatus('offline');
        setBotPingMessage(data.error || 'Offline');
        showToast(data.error || 'Bot Endpoint tidak merespons', 'error');
      }
    } catch {
      setBotPingStatus('offline');
      setBotPingMessage('Koneksi gagal');
      showToast('Gagal menghubungi endpoint bot', 'error');
    } finally {
      setIsTestingBotPing(false);
    }
  };

  // ── YouTube Preview Helpers ───────────────────────────────────────────
  const stopYtPreview = useCallback(() => {
    if (ytPreviewTimerRef.current) {
      clearInterval(ytPreviewTimerRef.current);
      ytPreviewTimerRef.current = null;
    }
    setIsYtPreviewPlaying(false);
    setYtPreviewElapsed(0);
  }, []);

  const startYtPreview = useCallback(() => {
    // Stop any existing preview first
    if (ytPreviewTimerRef.current) {
      clearInterval(ytPreviewTimerRef.current);
    }
    setYtPreviewElapsed(0);
    setIsYtPreviewPlaying(true);
    setYtPreviewKey(k => k + 1); // force iframe reload at new start time

    ytPreviewTimerRef.current = setInterval(() => {
      setYtPreviewElapsed(prev => {
        if (prev >= 29) {
          if (ytPreviewTimerRef.current) clearInterval(ytPreviewTimerRef.current);
          ytPreviewTimerRef.current = null;
          setIsYtPreviewPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  }, []);

  const handleToggleYtPreview = useCallback(() => {
    if (isYtPreviewPlaying) {
      stopYtPreview();
    } else {
      startYtPreview();
    }
  }, [isYtPreviewPlaying, stopYtPreview, startYtPreview]);

  // Stop preview when track changes or slider moves to new position
  useEffect(() => {
    stopYtPreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYtTrack?.videoId]);

  const handleYtSliderChange = useCallback((val: number) => {
    setYtStartSecond(val);
    // Restart preview at new position if currently playing
    if (isYtPreviewPlaying) {
      startYtPreview();
    }
  }, [isYtPreviewPlaying, startYtPreview]);

  const handleUploadStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyFile) {
      showToast('Pilih file media foto atau video terlebih dahulu', 'error');
      return;
    }
    setIsUploadingStory(true);
    try {
      const key = getActiveApiKey();
      const formData = new FormData();
      formData.append('file', storyFile);
      formData.append('apiKey', key);
      if (storyCaption.trim()) formData.append('caption', storyCaption.trim());
      if (storyDate) formData.append('timestamp', storyDate);
      if (storyCategory.trim()) formData.append('category', storyCategory.trim());

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'x-api-key': key },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showToast('Story berhasil diarsipkan!', 'success');
        setIsStoryModalOpen(false);
        setStoryFile(null);
        setStoryPreview(null);
        setStoryCaption('');
        setStoryDate('');
        setStoryCategory('General');
        await loadStories();
      } else {
        showToast(data.error || 'Gagal mengunggah story', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat mengunggah story', 'error');
    } finally {
      setIsUploadingStory(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    const prevStories = [...stories];
    setStories((prev) => prev.filter((s) => s.id !== id));

    try {
      const key = getActiveApiKey();
      const res = await fetch(`/api/stories?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': key },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Story berhasil dihapus dari arsip', 'success');
        await loadStories();
      } else {
        setStories(prevStories);
        showToast(data.error || 'Gagal menghapus story', 'error');
      }
    } catch {
      setStories(prevStories);
      showToast('Terjadi kesalahan saat menghapus story', 'error');
    }
  };

  const startEditStory = (story: IGStory) => {
    setEditingStory(story);
    setEditCaption(story.caption || '');
    setEditAuthor(story.author || 'comeinone.f');
    setEditCategory(story.category || 'General');
    setEditMediaType(story.mediaType || 'image');

    try {
      const d = new Date(story.timestamp);
      const offset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
      setEditTimestamp(localISOTime);
    } catch {
      setEditTimestamp('');
    }
  };

  const handleSaveStoryMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    setIsSavingStoryMeta(true);
    try {
      const key = getActiveApiKey();
      const res = await fetch('/api/stories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify({
          id: editingStory.id,
          caption: editCaption,
          timestamp: editTimestamp ? new Date(editTimestamp).toISOString() : editingStory.timestamp,
          author: editAuthor,
          category: editCategory,
          mediaType: editMediaType,
          apiKey: key,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Metadata story (jam, tanggal & caption) berhasil disimpan!', 'success');
        setEditingStory(null);
        await loadStories();
      } else {
        showToast(json.error || 'Gagal memperbarui metadata story', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan metadata', 'error');
    } finally {
      setIsSavingStoryMeta(false);
    }
  };

  // --- PROJECT MANAGEMENT HANDLERS ---
  const openCreateProjectModal = () => {
    setEditingProject(null);
    setIsCreatingNewProject(true);
    setProjTitle('');
    setProjCategory('Web Development');
    setProjDescription('');
    setProjTechStack('Next.js, TypeScript, TailwindCSS');
    setProjTeam('Ronn');
    setProjRepoUrl('');
    setProjDemoUrl('');
    setProjImage('');
    setProjFeatured(false);
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (proj: Project) => {
    setEditingProject(proj);
    setIsCreatingNewProject(false);
    setProjTitle(proj.title);
    setProjCategory(proj.category);
    setProjDescription(proj.description);
    setProjTechStack(proj.techStack.join(', '));
    setProjTeam(proj.team.join(', '));
    setProjRepoUrl(proj.repoUrl || '');
    setProjDemoUrl(proj.demoUrl || '');
    setProjImage(proj.image || '');
    setProjFeatured(proj.featured || false);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDescription.trim()) {
      showToast('Judul dan deskripsi proyek wajib diisi!', 'error');
      return;
    }

    setIsSavingProject(true);
    try {
      const techStackArr = projTechStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const teamArr = projTeam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const key = getActiveApiKey();
      const payload = {
        id: editingProject ? editingProject.id : undefined,
        title: projTitle.trim(),
        category: projCategory.trim() || 'Web Development',
        description: projDescription.trim(),
        techStack: techStackArr.length > 0 ? techStackArr : ['Next.js', 'TailwindCSS'],
        team: teamArr.length > 0 ? teamArr : ['CE F Class'],
        repoUrl: projRepoUrl.trim() || undefined,
        demoUrl: projDemoUrl.trim() || undefined,
        image: projImage.trim() || undefined,
        featured: projFeatured,
        apiKey: key,
      };

      const method = isCreatingNewProject ? 'POST' : 'PUT';
      const res = await fetch('/api/projects', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast(
          isCreatingNewProject ? 'Proyek baru berhasil ditambahkan!' : 'Proyek berhasil diperbarui!',
          'success'
        );
        setIsProjectModalOpen(false);
        await loadProjects();
      } else {
        showToast(json.error || 'Gagal menyimpan proyek', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan proyek', 'error');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    const prevProjects = [...adminProjects];
    setAdminProjects((prev) => prev.filter((p) => p.id !== id));

    try {
      const key = getActiveApiKey();
      const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify({ id, apiKey: key }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(`Proyek "${title}" berhasil dihapus`, 'success');
        await loadProjects();
      } else {
        setAdminProjects(prevProjects);
        showToast(json.error || 'Gagal menghapus proyek', 'error');
      }
    } catch {
      setAdminProjects(prevProjects);
      showToast('Terjadi kesalahan saat menghapus proyek', 'error');
    }
  };

  const handleToggleFeatured = async (proj: Project) => {
    try {
      const key = getActiveApiKey();
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify({
          ...proj,
          featured: !proj.featured,
          apiKey: key,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(
          !proj.featured ? `Proyek dimahkotai sebagai DEV'S PICK ⭐!` : 'Highlight DEV\'S PICK dicabut',
          'info'
        );
        await loadProjects();
      }
    } catch {
      showToast('Gagal mengubah status featured', 'error');
    }
  };

  // Filtered projects for search & category
  const filteredProjects = useMemo(() => {
    return adminProjects.filter((p) => {
      const q = projectSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q)) ||
        p.team.some((tm) => tm.toLowerCase().includes(q));

      const matchesCat = projectCategoryFilter === 'All' || p.category === projectCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [adminProjects, projectSearch, projectCategoryFilter]);

  const projectCategories = useMemo(() => {
    const list = Array.from(new Set(adminProjects.map((p) => p.category).filter(Boolean)));
    return ['All', ...list];
  }, [adminProjects]);

  // --- SONGS PLAYLIST HANDLERS ---
  const handleSearchMusicOnline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!musicSearchQuery.trim()) return;

    setIsSearchingMusic(true);
    setSelectedYtTrack(null);
    setTrimFeedback(null);
    try {
      const isUrl = musicSearchQuery.includes('http');
      const param = isUrl
        ? `url=${encodeURIComponent(musicSearchQuery.trim())}`
        : `q=${encodeURIComponent(musicSearchQuery.trim())}`;
      const res = await fetch(`/api/music/search?${param}&provider=${musicSearchProvider}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setMusicSearchResults(data.results);
        if (data.results.length === 0) {
          showToast('Tidak ada lagu ditemukan. Coba kata kunci atau judul lain.', 'info');
        }
      } else {
        showToast(data.error || 'Gagal mencari metadata lagu', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat mencari lagu', 'error');
    } finally {
      setIsSearchingMusic(false);
    }
  };

  const handleSelectSearchResult = (track: any) => {
    setFormSongTitle(track.title);
    setFormSongArtist(track.artist);
    setFormSongAlbum(track.album || '');
    setFormSongCoverUrl(track.coverUrl || '');
    setFormSongSpotifyUrl(track.spotifyUrl || '');
    setFormSongAppleMusicUrl(track.appleMusicUrl || '');

    if (track.provider === 'youtube') {
      setSelectedYtTrack(track);
      const dur = track.durationSeconds || 180;
      const defaultStart = Math.min(60, Math.max(0, Math.floor(dur / 3)));
      setYtStartSecond(defaultStart);
      setFormSongAudioUrl(''); // will be generated/trimmed
      setTrimFeedback(null);
      showToast(`Lagu YouTube "${track.title}" dipilih! Tentukan 30 detik yang ingin diambil.`, 'info');
    } else {
      setSelectedYtTrack(null);
      setFormSongAudioUrl(track.audioUrl || '');
      setTrimFeedback(null);
      showToast(`Metadata "${track.title}" berhasil disinkronkan otomatis!`, 'success');
    }
  };

  const handleTrimYouTubeAudio = async () => {
    if (!selectedYtTrack) return;
    setIsTrimmingAudio(true);
    setTrimFeedback(null);

    try {
      const key = getActiveApiKey();
      const res = await fetch('/api/music/trim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify({
          videoId: selectedYtTrack.videoId,
          youtubeUrl: selectedYtTrack.youtubeUrl,
          startSecond: ytStartSecond,
          duration: 30,
          title: formSongTitle,
          artist: formSongArtist,
          apiKey: key,
          botEndpoint: useBotEndpoint && botEndpointUrl.trim() ? botEndpointUrl.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (data.success && data.audioUrl) {
        setFormSongAudioUrl(data.audioUrl);
        const sourceMsg = useBotEndpoint ? 'via Bot Endpoint' : 'via Cloud Space';
        setTrimFeedback(`Audio 30s berhasil dipotong dari detik ${ytStartSecond}s (${sourceMsg})!`);
        showToast(`Cuplikan 30 detik berhasil di-generate!`, 'success');
      } else if (data.needsMicroservice) {
        setTrimFeedback(
          'Microservice yt-dlp / Bot endpoint belum terhubung. Aktifkan tombol "Gunakan Bot Endpoint" di bawah untuk menggunakan bot kamu.'
        );
        showToast('Microservice yt-dlp / Bot endpoint belum dikonfigurasi.', 'info');
      } else {
        showToast(data.error || 'Gagal memotong audio', 'error');
        setTrimFeedback(data.error);
      }
    } catch {
      showToast('Terjadi kesalahan saat memotong audio', 'error');
    } finally {
      setIsTrimmingAudio(false);
    }
  };

  const handleAudioFileUpload = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      showToast('Pilih file audio valid (.mp3, .m4a, .wav)', 'error');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormSongAudioUrl(reader.result);
          showToast(`File audio "${file.name}" berhasil dimuat!`, 'success');
        }
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('Gagal membaca file audio', 'error');
    }
  };

  const openCreateSongModal = () => {
    setEditingSong(null);
    setIsCreatingNewSong(true);
    setMusicSearchProvider('itunes');
    setMusicSearchQuery('');
    setMusicSearchResults([]);
    setSelectedYtTrack(null);
    setTrimFeedback(null);
    setFormSongTitle('');
    setFormSongArtist('');
    setFormSongAlbum('');
    setFormSongCoverUrl('');
    setFormSongAudioUrl('');
    setFormSongSpotifyUrl('');
    setFormSongAppleMusicUrl('');
    setFormSongSuggestedBy('Lagu Kebangsaan Kelas F');
    setFormSongNote('');
    setFormSongCategory('Class Anthem');
    setIsSongModalOpen(true);
  };

  const openEditSongModal = (song: Song) => {
    setEditingSong(song);
    setIsCreatingNewSong(false);
    setMusicSearchProvider('itunes');
    setMusicSearchQuery('');
    setMusicSearchResults([]);
    setSelectedYtTrack(null);
    setTrimFeedback(null);
    setFormSongTitle(song.title);
    setFormSongArtist(song.artist);
    setFormSongAlbum(song.album || '');
    setFormSongCoverUrl(song.coverUrl);
    setFormSongAudioUrl(song.audioUrl || '');
    setFormSongSpotifyUrl(song.spotifyUrl || '');
    setFormSongAppleMusicUrl(song.appleMusicUrl || '');
    setFormSongSuggestedBy(song.suggestedBy);
    setFormSongNote(song.note || '');
    setFormSongCategory(song.category || 'Class Anthem');
    setIsSongModalOpen(true);
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSongTitle.trim() || !formSongArtist.trim() || !formSongCoverUrl.trim()) {
      showToast('Judul lagu, nama artis, dan cover artwork wajib diisi!', 'error');
      return;
    }

    setIsSavingSong(true);
    try {
      const key = getActiveApiKey();
      const payload = {
        id: editingSong ? editingSong.id : undefined,
        title: formSongTitle.trim(),
        artist: formSongArtist.trim(),
        album: formSongAlbum.trim() || undefined,
        coverUrl: formSongCoverUrl.trim(),
        audioUrl: formSongAudioUrl.trim() || undefined,
        spotifyUrl: formSongSpotifyUrl.trim() || undefined,
        appleMusicUrl: formSongAppleMusicUrl.trim() || undefined,
        suggestedBy: formSongSuggestedBy.trim() || 'Lagu Kebangsaan Kelas F',
        note: formSongNote.trim() || undefined,
        category: formSongCategory.trim() || 'Class Anthem',
        apiKey: key,
      };

      const method = isCreatingNewSong ? 'POST' : 'PUT';
      const res = await fetch('/api/songs', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast(
          isCreatingNewSong ? 'Lagu berhasil ditambahkan ke playlist!' : 'Metadata lagu diperbarui!',
          'success'
        );
        setIsSongModalOpen(false);
        await loadSongs();
      } else {
        showToast(json.error || 'Gagal menyimpan lagu', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan lagu', 'error');
    } finally {
      setIsSavingSong(false);
    }
  };

  const handleDeleteSong = async (id: string, title: string) => {
    // Optimistic removal so UI updates instantly with 0ms delay
    const prevSongs = [...adminSongs];
    setAdminSongs((prev) => prev.filter((s) => s.id !== id));

    if (adminPlayingAudioId === id && adminAudioRef.current) {
      adminAudioRef.current.pause();
      setAdminPlayingAudioId(null);
    }

    try {
      const key = getActiveApiKey();
      const res = await fetch(`/api/songs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify({ id, apiKey: key }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(`Lagu "${title}" berhasil dihapus`, 'success');
        await loadSongs();
      } else {
        setAdminSongs(prevSongs);
        showToast(json.error || 'Gagal menghapus lagu', 'error');
      }
    } catch {
      setAdminSongs(prevSongs);
      showToast('Terjadi kesalahan saat menghapus lagu', 'error');
    }
  };

  const toggleAdminAudioPreview = (songId: string, audioUrl?: string) => {
    if (!audioUrl) {
      showToast('Audio preview tidak tersedia untuk lagu ini', 'info');
      return;
    }

    if (!adminAudioRef.current) {
      adminAudioRef.current = new Audio();
      adminAudioRef.current.onended = () => setAdminPlayingAudioId(null);
    }

    if (adminPlayingAudioId === songId) {
      adminAudioRef.current.pause();
      setAdminPlayingAudioId(null);
    } else {
      adminAudioRef.current.src = audioUrl;
      adminAudioRef.current.play().catch(() => {});
      setAdminPlayingAudioId(songId);
    }
  };

  const filteredSongs = useMemo(() => {
    return adminSongs.filter((s) => {
      const q = songSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        (s.album?.toLowerCase().includes(q) ?? false) ||
        s.suggestedBy.toLowerCase().includes(q) ||
        (s.category?.toLowerCase().includes(q) ?? false);

      const matchesCat = songCategoryFilter === 'All' || s.category === songCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [adminSongs, songSearch, songCategoryFilter]);

  const songCategories = useMemo(() => {
    const list = Array.from(new Set(adminSongs.map((s) => s.category).filter(Boolean))) as string[];
    return ['All', ...list];
  }, [adminSongs]);

  // Handle Passkey verification
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passkeyInput.toLowerCase().trim();
    const validKeys = ['cef2024', 'cef2025', 'fclass2025', 'admince-f', 'ronn', 'admin123'];
    if (validKeys.includes(clean)) {
      sessionStorage.setItem('cef_admin_auth', 'true');
      sessionStorage.setItem('cef_admin_passkey', passkeyInput.trim());
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cef_admin_auth');
    sessionStorage.removeItem('cef_admin_passkey');
    setIsAuthenticated(false);
    setPasskeyInput('');
  };

  // Filtered students for search & role
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nim.includes(q) ||
        (s.alias?.toLowerCase().includes(q) ?? false) ||
        (s.role?.toLowerCase().includes(q) ?? false);

      const matchesRole = roleFilter === 'All' || s.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [students, searchQuery, roleFilter]);

  // Unique roles
  const roles = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.role).filter(Boolean))) as string[];
    return ['All', ...list];
  }, [students]);

  // Stats
  const stats = useMemo(() => {
    const total = students.length;
    const withPhoto = students.filter((s) => Boolean(s.photo && s.photo.trim() !== '')).length;
    const leaders = students.filter((s) =>
      ['Komting', 'Wakil Komting', 'Sekretaris', 'Bendahara'].includes(s.role || '')
    ).length;
    return { total, withPhoto, leaders };
  }, [students]);

  // Launch Cropper for a student
  const startCropForStudent = (student: Student, fileOrSrc: File | string) => {
    setCropperStudent(student);
    if (typeof fileOrSrc === 'string') {
      setCropperImageSrc(fileOrSrc);
    } else {
      const url = URL.createObjectURL(fileOrSrc);
      setCropperImageSrc(url);
    }
    setCropperOpen(true);
  };

  // Save the cropped Blob from ImageCropperModal
  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!cropperStudent) return;
    setIsSaving(true);

    try {
      const key = getActiveApiKey();
      const formData = new FormData();
      formData.append('id', String(cropperStudent.id));
      formData.append('file', croppedBlob, `${cropperStudent.id}.jpg`);
      formData.append('apiKey', key);

      const res = await fetch('/api/admin/photo', {
        method: 'POST',
        headers: { 'x-api-key': key },
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        showToast(`Foto ${cropperStudent.name} berhasil di-crop dan disimpan!`, 'success');
        setCropperOpen(false);
        setCropperImageSrc(null);
        setCropperStudent(null);
        setActivePhotoStudent(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        await loadData();
      } else {
        showToast(result.error || 'Gagal mengupload foto', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan foto yang di-crop', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // File Picker Trigger -> Directly opens Cropper!
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activePhotoStudent) {
      startCropForStudent(activePhotoStudent, file);
    }
  };

  const handleDirectDropFile = (student: Student, file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa berkas gambar (JPG, PNG, WebP)!', 'error');
      return;
    }
    startCropForStudent(student, file);
  };

  const handleSavePhotoDirect = async () => {
    if (!activePhotoStudent) return;
    setIsSaving(true);

    try {
      const key = getActiveApiKey();
      if (customPhotoUrl.trim()) {
        const res = await fetch('/api/admin/photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
          },
          body: JSON.stringify({
            id: activePhotoStudent.id,
            photoUrl: customPhotoUrl.trim(),
            apiKey: key,
          }),
        });
        const result = await res.json();

        if (result.success) {
          showToast(`URL foto ${activePhotoStudent.name} disimpan!`, 'success');
          setActivePhotoStudent(null);
          setCustomPhotoUrl('');
          await loadData();
        } else {
          showToast(result.error || 'Gagal menyimpan URL foto', 'error');
        }
      } else if (selectedFile) {
        startCropForStudent(activePhotoStudent, selectedFile);
      } else {
        showToast('Pilih file gambar atau masukkan URL foto', 'info');
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhoto = async (student: Student) => {
    try {
      const key = getActiveApiKey();
      const res = await fetch(`/api/admin/photo?id=${encodeURIComponent(student.id)}`, {
        method: 'DELETE',
        headers: { 'x-api-key': key },
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Foto ${student.name} berhasil dihapus, kembali ke inisial!`, 'success');
        await loadData();
      } else {
        showToast('Gagal menghapus foto', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan sistem', 'error');
    }
  };

  // Drag & Drop: on student card -> Opens Cropper directly!
  const handleCardDragOver = (e: React.DragEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingCardId(id);
  };

  const handleCardDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingCardId(null);
  };

  const handleCardDrop = (e: React.DragEvent, student: Student) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingCardId(null);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      startCropForStudent(student, file);
      showToast(`Sesuaikan crop foto untuk ${student.name}`, 'info');
    } else {
      showToast('Harap drop file gambar (JPG, PNG, WEBP)', 'info');
    }
  };

  // Drag & Drop: in modal
  const handleModalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalDragging(true);
  };

  const handleModalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalDragging(false);
  };

  const handleModalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && activePhotoStudent) {
      startCropForStudent(activePhotoStudent, file);
    }
  };

  // Drag & Drop: Batch Upload
  const handleBatchUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      showToast('Harap drag file gambar (JPG, PNG, WEBP)', 'info');
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    const matchedNames: string[] = [];

    for (const file of imageFiles) {
      const baseName = file.name.split('.')[0].trim();
      const matchedStudent = students.find(
        (s) => String(s.id) === baseName || s.nim === baseName
      );

      if (matchedStudent) {
        const formData = new FormData();
        formData.append('id', String(matchedStudent.id));
        formData.append('file', file);

        try {
          const res = await fetch('/api/admin/photo', {
            method: 'POST',
            body: formData,
          });
          const result = await res.json();
          if (result.success) {
            successCount++;
            matchedNames.push(matchedStudent.name);
          }
        } catch {
          // ignore
        }
      }
    }

    if (successCount > 0) {
      showToast(`${successCount} foto berhasil diupdate otomatis (${matchedNames.join(', ')})!`, 'success');
      await loadData();
    } else {
      showToast('Beri nama file sesuai nomor ID (contoh: 1.jpg) atau NIM agar otomatis terhubung!', 'info');
    }
    setIsSaving(false);
  };

  // Student CRUD Form Handlers
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (!editingStudent.name.trim() || !editingStudent.nim.trim()) {
      showToast('Nama dan NIM wajib diisi!', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let updatedList: Student[];
      if (isCreatingNew) {
        const nextId =
          editingStudent.id ||
          (students.length > 0 ? Math.max(...students.map((s) => Number(s.id) || 0)) + 1 : 1);
        const newRecord = { ...editingStudent, id: nextId };
        updatedList = [...students, newRecord];
      } else {
        updatedList = students.map((s) => (s.id === editingStudent.id ? editingStudent : s));
      }

      const key = getActiveApiKey();
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify(updatedList),
      });

      const result = await res.json();
      if (result.success) {
        showToast(isCreatingNew ? 'Mahasiswa baru berhasil ditambahkan!' : 'Data mahasiswa diperbarui!', 'success');
        setEditingStudent(null);
        setIsCreatingNew(false);
        await loadData();
      } else {
        showToast(result.error || 'Gagal menyimpan data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    setIsSaving(true);
    try {
      const key = getActiveApiKey();
      const updatedList = students.filter((s) => s.id !== student.id);
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify(updatedList),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`${student.name} berhasil dihapus dari data`, 'success');
        await loadData();
      }
    } catch {
      showToast('Gagal menghapus data', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Raw JSON Save & Format
  const handleSaveRawJson = async () => {
    setIsSaving(true);
    try {
      const parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) {
        showToast('JSON harus berupa array [] data mahasiswa', 'error');
        setIsSaving(false);
        return;
      }

      const key = getActiveApiKey();
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify(parsed),
      });

      const result = await res.json();
      if (result.success) {
        showToast('File data mahasiswa.json berhasil diperbarui!', 'success');
        await loadData();
      } else {
        showToast(result.error || 'Gagal menyimpan file JSON', 'error');
      }
    } catch (err) {
      showToast(`Format JSON Salah: ${err instanceof Error ? err.message : 'Syntax Error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setRawJson(JSON.stringify(parsed, null, 4));
      showToast('JSON berhasil dirapikan!', 'info');
    } catch {
      showToast('JSON tidak valid, periksa kembali tanda koma dan petik', 'error');
    }
  };

  // Utility to download JSON files
  const handleDownloadJson = (content: string, filename: string) => {
    try {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Berkas ${filename} berhasil diunduh!`, 'success');
    } catch {
      showToast('Gagal mengunduh berkas', 'error');
    }
  };

  // Utility to copy JSON string to clipboard
  const handleCopyJson = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => showToast('Kode JSON berhasil disalin ke clipboard!', 'success'))
      .catch(() => showToast('Gagal menyalin kode', 'error'));
  };

  // --- THE JOURNEY (SHOWCASE) HANDLERS ---
  const openCreateSlideModal = () => {
    setEditingSlide(null);
    setIsCreatingNewSlide(true);
    setSlideTitle('');
    setSlideSubtitle('');
    setSlideTag('Orientation');
    setSlideSemester(1);
    setSlideDate('2025');
    setSlideDescription('');
    setSlideMediaUrl('/gallery/slide-orientation.jpg');
    setSlideMediaType('image');
    setSlideAccentColor('#3b82f6');
    setIsSlideModalOpen(true);
  };

  const openEditSlideModal = (slide: SlideItem) => {
    setEditingSlide(slide);
    setIsCreatingNewSlide(false);
    setSlideTitle(slide.title);
    setSlideSubtitle(slide.subtitle || '');
    setSlideTag(slide.tag || 'Milestone');
    setSlideSemester(slide.semester || 1);
    setSlideDate(slide.date || '');
    setSlideDescription(slide.description || '');
    setSlideMediaUrl(slide.mediaUrl || '');
    setSlideMediaType(slide.mediaType || 'image');
    setSlideAccentColor(slide.accentColor || '#3b82f6');
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle.trim() || !slideDescription.trim() || !slideMediaUrl.trim()) {
      showToast('Judul, deskripsi, dan URL media wajib diisi!', 'error');
      return;
    }

    setIsSavingSlide(true);
    try {
      const key = getActiveApiKey();
      const payload = {
        apiKey: key,
        id: editingSlide?.id,
        title: slideTitle.trim(),
        subtitle: slideSubtitle.trim(),
        tag: slideTag.trim(),
        semester: Number(slideSemester) || 1,
        date: slideDate.trim(),
        description: slideDescription.trim(),
        mediaUrl: slideMediaUrl.trim(),
        mediaType: slideMediaType,
        accentColor: slideAccentColor.trim() || '#3b82f6',
      };

      const res = await fetch('/api/journey', {
        method: isCreatingNewSlide ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          isCreatingNewSlide ? 'Slide baru berhasil ditambahkan ke The Journey!' : 'Slide The Journey berhasil diperbarui!',
          'success'
        );
        setIsSlideModalOpen(false);
        setEditingSlide(null);
        await loadSlides();
      } else {
        showToast(data.error || 'Gagal menyimpan slide', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan slide', 'error');
    } finally {
      setIsSavingSlide(false);
    }
  };

  const handleDeleteSlide = async (id: string, title: string) => {
    const prevSlides = [...adminSlides];
    setAdminSlides((prev) => prev.filter((s) => s.id !== id));

    try {
      const key = getActiveApiKey();
      const res = await fetch(`/api/journey?id=${id}&apiKey=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { 'x-api-key': key },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Slide "${title}" berhasil dihapus`, 'success');
        await loadSlides();
      } else {
        setAdminSlides(prevSlides);
        showToast(data.error || 'Gagal menghapus slide', 'error');
      }
    } catch {
      setAdminSlides(prevSlides);
      showToast('Gagal menghapus slide', 'error');
    }
  };

  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= adminSlides.length) return;

    const updated = [...adminSlides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setAdminSlides(updated);

    try {
      const key = getActiveApiKey();
      await fetch('/api/journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify({ apiKey: key, slides: updated }),
      });
      showToast('Urutan slide berhasil diperbarui!', 'info');
    } catch {
      showToast('Gagal memperbarui urutan slide', 'error');
    }
  };

  // --- GOD MODE (WEBSITE CONTENT) HANDLERS ---
  const handleSaveGodMode = async () => {
    setIsSavingGodMode(true);
    try {
      const key = getActiveApiKey();
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify({
          apiKey: key,
          hero: godHero,
          manifesto: godManifesto,
          footer: godFooter,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          data.isReadOnlyFs
            ? 'Konten website tersimpan di sesi server! (Vercel Serverless Mode)'
            : 'Konten website (God Mode) berhasil diperbarui!',
          'success'
        );
      } else {
        showToast(data.error || 'Gagal menyimpan konten website', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan konten', 'error');
    } finally {
      setIsSavingGodMode(false);
    }
  };

  // --- PASSKEY LOCK SCREEN (EASTER EGG GATEWAY) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-bg-elevated/90 border border-border-accent/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/15 border border-accent/40 flex items-center justify-center text-accent mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <Lock size={26} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-xs mb-2">
              <Sparkles size={12} />
              <span>EASTER EGG • SECRETARY & DEV</span>
            </div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">
              CE F Admin Console
            </h1>
            <p className="text-text-muted text-xs sm:text-sm mt-1">
              Area khusus sekretaris & dev untuk mengelola profil dan data kelas F.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-text-dim mb-1.5">
                Passcode Rahasia
              </label>
              <input
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Ketik passcode admin..."
                autoFocus
                className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-sm font-mono text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
              />
              {authError && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> Passcode salah! (Hint default: <span className="font-mono underline font-bold">cef2024</span>)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-accent hover:bg-accent/90 text-bg-primary font-heading font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            >
              <Unlock size={16} />
              <span>Buka Konsol Admin</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/60 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Website Portfolio</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- MAIN ADMIN CONSOLE (MOBILE FIRST) ---
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col selection:bg-accent/30 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-bg-elevated/80 backdrop-blur-md border-b border-border/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors group"
              title="Lihat Website Portfolio"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="font-heading font-bold text-sm">CE — F</span>
                <span className="hidden sm:inline-block ml-2 text-[11px] font-mono text-text-dim">
                  Console v1.0
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE DATA SYNC
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg border border-border hover:border-accent text-xs font-mono text-text-muted hover:text-accent transition-all flex items-center gap-1.5"
            >
              <ExternalLink size={13} />
              <span className="hidden xs:inline">Web Portfolio</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              title="Kunci / Keluar Admin"
            >
              <Lock size={14} />
              <span className="hidden sm:inline">Kunci</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* Header Hero Banner */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono tracking-widest text-accent uppercase">
                Sekretaris & Developer Portal
              </p>
              <h1 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-text-primary">
                Pusat Pengelolaan Kelas F
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl bg-bg-surface border border-border hover:border-accent/40 text-text-muted hover:text-accent text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                <span>Sync Data</span>
              </button>

              <button
                onClick={() => {
                  setEditingStudent({
                    id: students.length + 1,
                    name: '',
                    nim: '',
                    alias: '',
                    role: 'Anggota',
                    katakata: '',
                  });
                  setIsCreatingNew(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              >
                <Plus size={14} />
                <span>Tambah Mahasiswa</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            <div className="p-3 rounded-xl border border-border bg-bg-elevated/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-text-dim uppercase">Total Anggota</p>
                <p className="text-base font-heading font-bold">{stats.total}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-bg-elevated/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ImageIcon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-text-dim uppercase">Foto Terpasang</p>
                <p className="text-base font-heading font-bold">{stats.withPhoto} / {stats.total}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-bg-elevated/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-text-dim uppercase">Pengurus Inti</p>
                <p className="text-base font-heading font-bold">{stats.leaders}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-bg-elevated/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <FileCode size={18} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-text-dim uppercase">Database</p>
                <p className="text-xs font-mono text-text-muted truncate">data mahasiswa.json</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Unified Structure) */}
        <div className="flex items-center gap-1.5 p-1 bg-bg-elevated border border-border rounded-2xl mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-accent text-bg-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <Users size={15} />
            <span>Data Mahasiswa ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('journey')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'journey'
                ? 'bg-accent text-bg-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <Layers size={15} />
            <span>The Journey ({adminSlides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 min-w-[125px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-accent text-bg-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <FolderGit2 size={15} />
            <span>Proyek Kelas ({adminProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`flex-1 min-w-[125px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'music'
                ? 'bg-accent text-bg-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <Music size={15} />
            <span>Playlist Lagu ({adminSongs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stories')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'stories'
                ? 'bg-accent text-bg-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <Sparkles size={15} />
            <span>Arsip Story IG</span>
          </button>

          <button
            onClick={() => setActiveTab('godmode')}
            className={`flex-1 min-w-[125px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'godmode'
                ? 'bg-accent text-bg-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <Globe size={15} />
            <span>⚡ God Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('absensi')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'absensi'
                ? 'bg-accent text-bg-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <ClipboardList size={15} />
            <span>📋 Absensi Kelas</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-accent text-bg-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <Sparkles size={15} />
            <span>Next Fitur 🚀</span>
          </button>
        </div>

        {/* TAB: DATA MAHASISWA (UNIFIED SECTION: IDENTITAS, FOTO PROFIL, DAN RAW CODE JSON) */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            {/* Sub-navigation Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-bg-elevated border border-border">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStudentSubTab('identity')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-heading font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    studentSubTab === 'identity'
                      ? 'bg-accent text-bg-primary shadow-sm font-bold'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/60'
                  }`}
                >
                  <Users size={14} />
                  <span>📇 Form &amp; Identitas</span>
                </button>

                <button
                  onClick={() => setStudentSubTab('photos')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-heading font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    studentSubTab === 'photos'
                      ? 'bg-accent text-bg-primary shadow-sm font-bold'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/60'
                  }`}
                >
                  <Camera size={14} />
                  <span>📸 Foto Profil &amp; Crop ({stats.withPhoto}/{stats.total})</span>
                </button>

                <button
                  onClick={() => setStudentSubTab('json')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-heading font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    studentSubTab === 'json'
                      ? 'bg-accent text-bg-primary shadow-sm font-bold'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/60'
                  }`}
                >
                  <FileCode size={14} />
                  <span>💻 Raw Code JSON</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadJson(rawJson, 'data mahasiswa.json')}
                  className="px-3 py-1.5 rounded-xl border border-border bg-bg-surface hover:border-accent/40 text-xs font-mono text-text-muted hover:text-accent transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Unduh backup data mahasiswa.json"
                >
                  <Download size={13} />
                  <span>Unduh JSON</span>
                </button>
                <button
                  onClick={() => handleCopyJson(rawJson)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-bg-surface hover:border-accent/40 text-xs font-mono text-text-muted hover:text-accent transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Salin JSON ke clipboard"
                >
                  <Copy size={13} />
                  <span>Salin Kode</span>
                </button>
              </div>
            </div>

            {/* SUB-TAB 1: IDENTITAS & FORM MAHASISWA */}
            {studentSubTab === 'identity' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama, NIM, atau alias..."
                      className="w-full pl-9 pr-8 py-2 bg-bg-elevated border border-border rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingStudent({
                          id: students.length + 1,
                          name: '',
                          nim: '',
                          alias: '',
                          role: 'Anggota',
                          katakata: '',
                        });
                        setIsCreatingNew(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-accent text-bg-primary text-xs font-heading font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Tambah Mahasiswa Baru</span>
                    </button>
                  </div>
                </div>

                {/* Students Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl border border-border bg-bg-elevated/50 hover:border-border-accent/40 transition-all flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-bg-surface border border-border text-accent font-semibold">
                              #{s.id}
                            </span>
                            <span className="font-mono text-xs text-text-muted">{s.nim}</span>
                          </div>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent-dim/30 border border-border-accent text-accent uppercase">
                            {s.role || 'Anggota'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <PhotoAvatar student={s} size="w-10 h-10" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-heading font-semibold text-base text-text-primary truncate">
                              {s.name}
                            </h3>
                            {s.alias && (
                              <p className="text-xs text-text-muted truncate">
                                <span className="text-text-dim font-mono">Alias:</span> {s.alias}
                              </p>
                            )}
                          </div>
                        </div>

                        {s.instagram && (
                          <p className="text-xs text-pink-400 mt-0.5 font-mono">
                            <span className="text-text-dim">IG:</span> @{s.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/^@/, '').replace(/\/$/, '')}
                          </p>
                        )}

                        {s.katakata && (
                          <p className="text-xs text-text-dim italic mt-2 line-clamp-2 bg-bg-surface/50 p-2 rounded-lg border border-border/40">
                            &ldquo;{s.katakata}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                        <button
                          onClick={() => {
                            setEditingStudent(s);
                            setIsCreatingNew(false);
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-bg-surface border border-border hover:border-accent text-xs font-heading font-semibold text-text-muted hover:text-accent transition-colors cursor-pointer"
                        >
                          Edit Identitas
                        </button>
                        <button
                          onClick={() => {
                            setActivePhotoStudent(s);
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            setCustomPhotoUrl(s.photo || '');
                          }}
                          className="py-1.5 px-3 rounded-xl bg-accent/10 border border-accent/25 hover:bg-accent hover:text-bg-primary text-xs font-heading font-semibold text-accent transition-colors cursor-pointer flex items-center gap-1"
                          title="Ganti Foto Profil"
                        >
                          <Camera size={13} />
                          <span>Foto</span>
                        </button>
                        {confirmDeleteStudentId === s.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                handleDeleteStudent(s);
                                setConfirmDeleteStudentId(null);
                              }}
                              className="px-2 py-1.5 rounded-xl bg-red-500 text-white text-[10px] font-mono font-bold hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                            >
                              Hapus!
                            </button>
                            <button
                              onClick={() => setConfirmDeleteStudentId(null)}
                              className="p-1.5 rounded-xl bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
                              title="Batal"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteStudentId(s.id)}
                            className="p-2 rounded-xl border border-border hover:border-red-500/40 hover:bg-red-500/10 text-text-dim hover:text-red-400 transition-colors cursor-pointer"
                            title="Hapus Mahasiswa"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: FOTO PROFIL & BATCH DROPZONE */}
            {studentSubTab === 'photos' && (
              <div className="space-y-4">
                {/* Interactive Batch Drag & Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsBatchDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsBatchDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsBatchDragging(false);
                    if (e.dataTransfer.files?.length) {
                      handleBatchUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => batchInputRef.current?.click()}
                  className={`p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 select-none ${
                    isBatchDragging
                      ? 'border-accent bg-accent/15 scale-[1.01] shadow-[0_0_25px_rgba(0,240,255,0.25)]'
                      : 'border-accent/30 bg-accent/5 hover:border-accent/60 hover:bg-accent/10'
                  }`}
                >
                  <input
                    ref={batchInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handleBatchUpload(e.target.files);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="flex items-center gap-3.5 text-center sm:text-left">
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shrink-0 mx-auto sm:mx-0">
                      <Upload size={22} className={isBatchDragging ? 'animate-bounce' : ''} />
                    </div>
                    <div>
                      <h4 className="text-sm font-heading font-bold text-text-primary flex items-center justify-center sm:justify-start gap-1.5">
                        <span>Batch Drag &amp; Drop Foto</span>
                        <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-mono">
                          AUTO-ID
                        </span>
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        Tarik file foto (misal: <code className="text-accent font-mono">1.jpg</code>, <code className="text-accent font-mono">2.png</code>) langsung ke sini untuk update otomatis banyak mahasiswa sekaligus!
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-2 rounded-xl bg-accent text-bg-primary text-xs font-heading font-bold whitespace-nowrap shadow-sm">
                    Upload Banyak File
                  </span>
                </div>

                {/* Search and filter bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter nama mahasiswa untuk ganti foto..."
                      className="w-full pl-9 pr-8 py-2 bg-bg-elevated border border-border rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredStudents.map((s) => {
                    const hasCustomPhoto = Boolean(s.photo && s.photo.trim() !== '');

                    return (
                      <div
                        key={s.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDraggingCardId(s.id);
                        }}
                        onDragLeave={() => setDraggingCardId(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDraggingCardId(null);
                          if (e.dataTransfer.files?.[0]) {
                            handleDirectDropFile(s, e.dataTransfer.files[0]);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          draggingCardId === s.id
                            ? 'border-accent bg-accent/20 scale-[1.02] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                            : 'border-border bg-bg-elevated/40 hover:border-border-accent/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <PhotoAvatar student={s} size="w-12 h-12" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg-surface border border-border text-accent">
                                #{s.id}
                              </span>
                              <span className="text-[10px] font-mono text-text-dim truncate">
                                {s.nim}
                              </span>
                            </div>
                            <h4 className="font-heading font-semibold text-xs text-text-primary truncate">
                              {s.name}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-2 border-t border-border/40">
                          <button
                            onClick={() => {
                              setActivePhotoStudent(s);
                              setSelectedFile(null);
                              setPreviewUrl(null);
                              setCustomPhotoUrl(s.photo || '');
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-accent/15 border border-accent/30 hover:bg-accent hover:text-bg-primary text-accent text-xs font-heading font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CropIcon size={14} />
                            <span>{hasCustomPhoto ? 'Ganti & Crop' : 'Upload & Crop'}</span>
                          </button>

                          {hasCustomPhoto && (
                            confirmDeletePhotoId === s.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    handleDeletePhoto(s);
                                    setConfirmDeletePhotoId(null);
                                  }}
                                  className="px-2 py-1.5 rounded-xl bg-red-500 text-white text-[10px] font-mono font-bold hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                                >
                                  Hapus!
                                </button>
                                <button
                                  onClick={() => setConfirmDeletePhotoId(null)}
                                  className="p-1.5 rounded-xl bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
                                  title="Batal"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeletePhotoId(s.id)}
                                className="p-2 rounded-xl border border-border hover:border-red-500/40 hover:bg-red-500/10 text-text-dim hover:text-red-400 transition-colors cursor-pointer"
                                title="Reset Foto ke Inisial"
                              >
                                <Trash2 size={14} />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: RAW JSON CODE EDITOR */}
            {studentSubTab === 'json' && (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-bg-elevated border border-border">
                  <div>
                    <h3 className="text-xs sm:text-sm font-heading font-semibold text-text-primary">
                      Editor Berkas data mahasiswa.json
                    </h3>
                    <p className="text-[11px] text-text-muted">
                      Edit langsung struktur data mahasiswa. Didukung perlindungan EROFS otomatis untuk Vercel.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFormatJson}
                      className="px-3 py-1.5 rounded-xl border border-border bg-bg-surface hover:border-accent/40 text-xs font-mono text-text-muted hover:text-accent transition-colors cursor-pointer"
                    >
                      Rapikan (Format)
                    </button>
                    <button
                      onClick={handleSaveRawJson}
                      disabled={isSaving}
                      className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Save size={14} />
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan JSON'}</span>
                    </button>
                  </div>
                </div>

                <div className="relative flex-1 min-h-[500px] border border-border rounded-2xl overflow-hidden bg-[#0d0d11]">
                  <textarea
                    value={rawJson}
                    onChange={(e) => setRawJson(e.target.value)}
                    spellCheck={false}
                    className="w-full h-full min-h-[500px] p-4 bg-transparent font-mono text-xs sm:text-sm text-emerald-400 focus:outline-none resize-none leading-relaxed selection:bg-accent/30 selection:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: THE JOURNEY OF CE F (TIMELINE SHOWCASE) */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Hero Header */}
            <div className="p-5 rounded-2xl border border-accent/40 bg-gradient-to-r from-blue-500/10 via-accent/10 to-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent font-mono text-xs mb-2">
                  <Layers size={13} />
                  <span>INTERACTIVE GALLERY SHOWCASE</span>
                </div>
                <h2 className="text-lg font-heading font-bold text-text-primary">
                  The Journey of CE F (Showcase Slideshow)
                </h2>
                <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
                  Kelola babak, milestone, narasi, foto/video, tag, dan semester yang tampil di showcase cinematic Apple-style pada halaman utama.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadSlides}
                  disabled={isLoadingSlides}
                  className="px-3 py-2 rounded-xl bg-bg-surface border border-border hover:border-accent/40 text-text-muted hover:text-accent text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={isLoadingSlides ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={openCreateSlideModal}
                  className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                >
                  <Plus size={14} />
                  <span>Tambah Slide Baru</span>
                </button>
              </div>
            </div>

            {/* Slides List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-semibold text-text-primary">
                  Daftar Slide Milestone ({adminSlides.length})
                </h3>
                <Link
                  href="/#timeline"
                  className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                >
                  <Eye size={13} />
                  <span>Pratinjau di Homepage</span>
                </Link>
              </div>

              {isLoadingSlides ? (
                <div className="p-12 text-center text-text-muted">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-accent" />
                  <p className="text-xs font-mono">Memuat slide The Journey...</p>
                </div>
              ) : adminSlides.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-bg-elevated/30">
                  <p className="text-sm text-text-muted mb-3">Belum ada slide di The Journey</p>
                  <button
                    onClick={openCreateSlideModal}
                    className="px-3.5 py-2 rounded-xl bg-accent text-bg-primary text-xs font-heading font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Tambah Slide Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="p-4 rounded-2xl border border-border bg-bg-elevated/60 hover:border-accent/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      {/* Left: Preview & Order & Info */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                        {/* Order Number & Move Buttons */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleMoveSlide(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded-md bg-bg-surface hover:bg-accent hover:text-bg-primary text-text-dim transition-colors disabled:opacity-20 cursor-pointer"
                            title="Pindah ke Atas"
                          >
                            <ChevronUp size={13} />
                          </button>
                          <span className="font-mono text-xs font-bold text-accent">
                            #{index + 1}
                          </span>
                          <button
                            onClick={() => handleMoveSlide(index, 'down')}
                            disabled={index === adminSlides.length - 1}
                            className="p-1 rounded-md bg-bg-surface hover:bg-accent hover:text-bg-primary text-text-dim transition-colors disabled:opacity-20 cursor-pointer"
                            title="Pindah ke Bawah"
                          >
                            <ChevronDown size={13} />
                          </button>
                        </div>

                        {/* Thumbnail / Media Preview */}
                        <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-border">
                          {slide.mediaType === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-accent">
                              <Video size={20} />
                            </div>
                          ) : (
                            <img
                              src={slide.mediaUrl}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <span
                            className="absolute bottom-0 inset-x-0 h-1"
                            style={{ backgroundColor: slide.accentColor || '#3b82f6' }}
                          />
                        </div>

                        {/* Slide Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border"
                              style={{
                                borderColor: `${slide.accentColor || '#3b82f6'}40`,
                                color: slide.accentColor || '#3b82f6',
                                backgroundColor: `${slide.accentColor || '#3b82f6'}15`,
                              }}
                            >
                              {slide.tag || 'Milestone'}
                            </span>
                            <span className="text-[10px] font-mono text-text-dim">
                              Sem {slide.semester || 1} • {slide.date}
                            </span>
                          </div>
                          <h4 className="text-sm font-heading font-bold text-text-primary truncate">
                            {slide.title}
                          </h4>
                          {slide.subtitle && (
                            <p className="text-xs text-accent font-medium truncate mt-0.5">
                              {slide.subtitle}
                            </p>
                          )}
                          <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                            {slide.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => openEditSlideModal(slide)}
                          className="px-3 py-1.5 rounded-xl bg-bg-surface border border-border hover:border-accent text-xs font-mono text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                        {confirmDeleteSlideId === slide.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                handleDeleteSlide(slide.id, slide.title);
                                setConfirmDeleteSlideId(null);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-red-500 text-white text-xs font-mono font-bold hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                            >
                              Hapus!
                            </button>
                            <button
                              onClick={() => setConfirmDeleteSlideId(null)}
                              className="p-1.5 rounded-xl bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
                              title="Batal"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteSlideId(slide.id)}
                            className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                            title="Hapus Slide"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: KELOLA PROYEK MAHASISWA & WHAT WE BUILD */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="p-5 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-cyan-500/10 to-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent font-mono text-xs mb-2">
                  <FolderGit2 size={13} />
                  <span>SHOWCASE & REPOSITORY KARYA KELAS</span>
                </div>
                <h2 className="text-lg font-heading font-bold text-text-primary">
                  Koleksi Proyek Mahasiswa (What We Build)
                </h2>
                <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
                  Kelola proyek teknologi buatanmu atau teman sekelas. Proyek yang ditambahkan di sini akan tampil di section What We Build lengkap dengan banner, tech stack, link demo web / bot WhatsApp, dan label unggulan DEV'S PICK.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadProjects}
                  disabled={isLoadingProjects}
                  className="px-3 py-2 rounded-xl bg-bg-surface border border-border hover:border-accent/40 text-text-muted hover:text-accent text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Muat ulang proyek"
                >
                  <RefreshCw size={13} className={isLoadingProjects ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={openCreateProjectModal}
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                >
                  <Plus size={15} />
                  <span>Tambah Proyek Baru</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-bg-elevated border border-border rounded-2xl">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Cari judul, tech stack, nama pembuat..."
                  className="w-full pl-9 pr-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={projectCategoryFilter}
                  onChange={(e) => setProjectCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  {projectCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'Semua Kategori' : cat}
                    </option>
                  ))}
                </select>

                <span className="text-xs font-mono text-text-dim whitespace-nowrap">
                  {filteredProjects.length} Proyek
                </span>
              </div>
            </div>

            {/* Project Cards Grid */}
            {isLoadingProjects ? (
              <div className="py-16 text-center text-xs font-mono text-text-dim flex flex-col items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-accent" />
                <span>Memuat daftar proyek kelas...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-bg-elevated/20 p-8 flex flex-col items-center justify-center">
                <FolderGit2 size={36} className="text-text-dim mb-3" />
                <p className="text-sm font-heading font-semibold text-text-primary mb-1">
                  Belum ada proyek yang ditemukan
                </p>
                <p className="text-xs text-text-muted max-w-sm mb-4">
                  {projectSearch || projectCategoryFilter !== 'All'
                    ? 'Tidak ada proyek yang sesuai dengan kata kunci pencarian atau kategori ini.'
                    : 'Belum ada proyek karya kelas yang didaftarkan.'}
                </p>
                <button
                  onClick={openCreateProjectModal}
                  className="px-4 py-2 rounded-xl bg-accent text-bg-primary text-xs font-heading font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Proyek Pertama</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProjects.map((proj) => {
                  const isWa = proj.demoUrl?.includes('wa.me') || proj.demoUrl?.includes('whatsapp.com');
                  return (
                    <div
                      key={proj.id}
                      className={`group relative bg-bg-elevated/60 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:border-accent/50 hover:shadow-lg ${
                        proj.featured
                          ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                          : 'border-border'
                      }`}
                    >
                      {/* Banner Preview */}
                      <div className="relative aspect-video w-full overflow-hidden bg-bg-primary/80 border-b border-border">
                        {proj.image ? (
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}

                        {/* Cybernetic fallback backdrop pattern */}
                        <div
                          className={`absolute inset-0 flex flex-col items-center justify-center p-4 text-center ${
                            proj.image ? '-z-10' : ''
                          } bg-gradient-to-br from-bg-surface via-bg-elevated to-bg-primary`}
                        >
                          <div className="w-12 h-12 rounded-xl border border-accent/30 bg-accent/10 flex items-center justify-center text-accent mb-2">
                            <FolderGit2 size={24} />
                          </div>
                          <span className="text-xs font-mono font-bold text-text-primary tracking-wider uppercase">
                            {proj.title}
                          </span>
                          <span className="text-[10px] font-mono text-text-dim mt-0.5">
                            {proj.image || 'public/projects/'}
                          </span>
                        </div>

                        {/* Badges Top Overlay */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                          <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-text-primary">
                            {proj.category}
                          </span>

                          <button
                            onClick={() => handleToggleFeatured(proj)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              proj.featured
                                ? 'bg-amber-500/90 text-black border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                : 'bg-black/70 hover:bg-black/90 text-text-dim hover:text-amber-400 border border-white/10'
                            }`}
                            title="Klik untuk ubah status DEV'S PICK"
                          >
                            <Star size={11} className={proj.featured ? 'fill-current' : ''} />
                            <span>{proj.featured ? "DEV'S PICK" : 'Set Featured'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="text-sm font-heading font-bold text-text-primary line-clamp-1">
                              {proj.title}
                            </h3>
                            <span className="text-[10px] font-mono text-text-dim shrink-0">
                              {proj.team.join(', ')}
                            </span>
                          </div>

                          <p className="text-xs text-text-muted line-clamp-3 leading-relaxed mb-3">
                            {proj.description}
                          </p>

                          {/* Tech Stack Pills */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {proj.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 rounded-md bg-bg-surface border border-border text-[10px] font-mono text-text-dim"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons & Links */}
                        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {proj.repoUrl && (
                              <a
                                href={proj.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg border border-border hover:border-accent/40 text-text-muted hover:text-accent transition-colors"
                                title="Buka Repository GitHub"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            {proj.demoUrl && (
                              <a
                                href={proj.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors ${
                                  isWa
                                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                                    : 'bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25'
                                }`}
                                title={isWa ? 'Coba Bot WhatsApp' : 'Buka Demo Web'}
                              >
                                {isWa ? <MessageSquare size={11} /> : <Globe size={11} />}
                                <span>{isWa ? 'Bot WA' : 'Live'}</span>
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditProjectModal(proj)}
                              className="px-2.5 py-1 rounded-lg bg-bg-surface border border-border hover:border-accent/40 text-text-muted hover:text-text-primary text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                              title="Edit Deskripsi & Metadata Proyek"
                            >
                              <Pencil size={11} />
                              <span>Edit</span>
                            </button>

                            {confirmDeleteProjId === proj.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    handleDeleteProject(proj.id, proj.title);
                                    setConfirmDeleteProjId(null);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-mono font-bold hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                                >
                                  Hapus!
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteProjId(null)}
                                  className="p-1 rounded-lg bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
                                  title="Batal"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteProjId(proj.id)}
                                className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                title="Hapus Proyek"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: PLAYLIST LAGU KELAS (THE FREQUENCY) */}
        {activeTab === 'music' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-accent/10 to-pink-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 font-mono text-xs mb-2">
                  <Music size={13} />
                  <span>THE FREQUENCY — PLAYLIST LAGU KELAS</span>
                </div>
                <h2 className="text-lg font-heading font-bold text-text-primary">
                  Soundtrack Perjalanan &amp; Begadang Kelas F
                </h2>
                <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
                  Kelola lagu-lagu kebangsaan dan rekomendasi mahasiswa yang tampil di section The Frequency. Kamu bisa mencari lagu secara otomatis (cover HD, artis, album &amp; audio preview akan ditarik langsung).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadSongs}
                  disabled={isLoadingSongs}
                  className="px-3 py-2 rounded-xl bg-bg-surface border border-border hover:border-accent/40 text-text-muted hover:text-accent text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Muat ulang playlist"
                >
                  <RefreshCw size={13} className={isLoadingSongs ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={openCreateSongModal}
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                >
                  <Plus size={15} />
                  <span>Tambah Lagu Baru</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-bg-elevated border border-border rounded-2xl">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="text"
                  value={songSearch}
                  onChange={(e) => setSongSearch(e.target.value)}
                  placeholder="Cari judul lagu, artis, atau perekomendasi..."
                  className="w-full pl-9 pr-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={songCategoryFilter}
                  onChange={(e) => setSongCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  {songCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'Semua Kategori' : cat}
                    </option>
                  ))}
                </select>

                <span className="text-xs font-mono text-text-dim whitespace-nowrap">
                  {filteredSongs.length} Lagu
                </span>
              </div>
            </div>

            {/* Songs Grid */}
            {isLoadingSongs ? (
              <div className="py-16 text-center text-xs font-mono text-text-dim flex flex-col items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-accent" />
                <span>Memuat playlist kelas...</span>
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-bg-elevated/20 p-8 flex flex-col items-center justify-center">
                <Music size={36} className="text-text-dim mb-3" />
                <p className="text-sm font-heading font-semibold text-text-primary mb-1">
                  Belum ada lagu yang ditemukan
                </p>
                <p className="text-xs text-text-muted max-w-sm mb-4">
                  {songSearch || songCategoryFilter !== 'All'
                    ? 'Tidak ada lagu yang cocok dengan pencarian atau filter kategori ini.'
                    : 'Playlist masih kosong. Klik tombol di bawah untuk menambah lagu pertama.'}
                </p>
                <button
                  onClick={openCreateSongModal}
                  className="px-4 py-2 rounded-xl bg-accent text-bg-primary text-xs font-heading font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Lagu Pertama</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSongs.map((song) => {
                  const isAudioPlaying = adminPlayingAudioId === song.id;
                  return (
                    <div
                      key={song.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between bg-bg-elevated/60 ${
                        isAudioPlaying
                          ? 'border-accent shadow-[0_0_20px_rgba(0,240,255,0.2)] ring-1 ring-accent'
                          : 'border-border hover:border-border-accent/60'
                      }`}
                    >
                      <div>
                        {/* Top: Cover + Play button + Info */}
                        <div className="flex items-start gap-3.5 mb-3">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-border group">
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Preview play button overlay */}
                            {song.audioUrl && (
                              <button
                                onClick={() => toggleAdminAudioPreview(song.id, song.audioUrl)}
                                className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${
                                  isAudioPlaying
                                    ? 'bg-black/60 text-accent opacity-100'
                                    : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'
                                }`}
                                title={isAudioPlaying ? 'Jeda Audio' : 'Dengarkan Preview 30 Detik'}
                              >
                                {isAudioPlaying ? (
                                  <Pause size={18} />
                                ) : (
                                  <Play size={18} className="ml-0.5 fill-current" />
                                )}
                              </button>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {song.category && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-bg-surface border border-border text-accent">
                                  {song.category}
                                </span>
                              )}
                              {isAudioPlaying && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 animate-pulse">
                                  PLAYING PREVIEW
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-heading font-bold text-text-primary truncate">
                              {song.title}
                            </h3>
                            <p className="text-xs font-mono text-text-muted truncate">
                              {song.artist}
                            </p>
                            {song.album && (
                              <p className="text-[11px] text-text-dim truncate">
                                {song.album}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Contributor & Note */}
                        <div className="space-y-1.5 pt-2 border-t border-border/40">
                          <div className="flex items-center gap-1.5 text-xs text-text-muted">
                            <span className="text-[10px] font-mono text-text-dim">Pilihan:</span>
                            <span className="font-heading font-semibold text-text-primary truncate">
                              {song.suggestedBy}
                            </span>
                          </div>

                          {song.note && (
                            <p className="text-[11px] text-text-dim italic line-clamp-2 bg-bg-surface/50 p-2 rounded-xl border border-border/40">
                              &ldquo;{song.note}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {song.spotifyUrl && (
                            <a
                              href={song.spotifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-lg text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink size={10} />
                              <span>Spotify</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditSongModal(song)}
                            className="px-2.5 py-1 rounded-lg bg-bg-surface border border-border hover:border-accent text-[11px] font-mono text-text-muted hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1"
                            title="Edit Lagu & Catatan"
                          >
                            <Pencil size={11} />
                            <span>Edit</span>
                          </button>

                          {confirmDeleteSongId === song.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  handleDeleteSong(song.id, song.title);
                                  setConfirmDeleteSongId(null);
                                }}
                                className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-mono font-bold hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                              >
                                Hapus!
                              </button>
                              <button
                                onClick={() => setConfirmDeleteSongId(null)}
                                className="p-1 rounded-lg bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
                                title="Batal"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteSongId(song.id)}
                              className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                              title="Hapus Lagu"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: ARSIP STORY IG & BOT INGESTION */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-xs mb-2">
                  <Sparkles size={13} />
                  <span>ARSIP INSTAGRAM STORIES PERMANEN</span>
                </div>
                <h2 className="text-lg font-heading font-bold text-text-primary">
                  Koleksi Story @comeinone.f
                </h2>
                <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
                  Story yang diposting oleh akun kelas dapat diarsipkan ke sini secara otomatis lewat WhatsApp Bot (WABOT) atau diupload langsung. Story di web tidak hilang setelah 24 jam.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadStories}
                  disabled={isLoadingStories}
                  className="px-3 py-2 rounded-xl bg-bg-surface border border-border hover:border-accent/40 text-text-muted hover:text-accent text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={isLoadingStories ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => {
                    setStoryFile(null);
                    setStoryPreview(null);
                    setStoryCaption('');
                    setStoryDate('');
                    setStoryCategory('General');
                    setIsStoryModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  <Plus size={14} />
                  <span>Upload Story Manual</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Bot Webhook Guide Box */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border bg-bg-elevated/40 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-heading font-bold text-text-primary">
                    Dokumentasi API untuk WhatsApp Bot (WABOT)
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    Gunakan endpoint ini agar Bot WhatsApp kelasmu bisa otomatis meneruskan foto/video story ke website.
                  </p>
                </div>
              </div>

              <div className="bg-[#0d0d11] p-3 rounded-xl border border-border font-mono text-[11px] space-y-1.5 text-text-muted overflow-x-auto">
                <p className="text-emerald-400 font-bold">
                  POST /api/stories
                </p>
                <p>Header: <span className="text-text-primary">x-api-key: cef2024</span></p>
                <p>Content-Type: <span className="text-text-primary">multipart/form-data</span></p>
                <p>Body Form: <span className="text-accent">file</span> (image/video), <span className="text-accent">caption</span> (string), <span className="text-accent">author</span> (&quot;comeinone.f&quot;)</p>
              </div>
            </div>

            {/* Stories Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-semibold text-text-primary">
                  Daftar Story Tersimpan ({stories.length})
                </h3>
                <Link
                  href="/"
                  className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                >
                  <Eye size={13} />
                  <span>Lihat di Halaman Utama</span>
                </Link>
              </div>

              {stories.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-border bg-bg-elevated/30">
                  <Sparkles size={32} className="text-text-dim mx-auto mb-2" />
                  <p className="text-sm font-heading font-semibold text-text-muted">Belum ada story yang diarsipkan</p>
                  <p className="text-xs text-text-dim mt-1">Upload story pertama atau kirim melalui bot WA!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stories.map((story) => (
                    <div
                      key={story.id}
                      className="group rounded-2xl border border-border bg-bg-elevated/50 overflow-hidden flex flex-col justify-between hover:border-border-accent/50 transition-all duration-200"
                    >
                      {/* Media Preview Box */}
                      <div className="relative aspect-[9/14] bg-black overflow-hidden flex items-center justify-center">
                        {story.mediaType === 'video' ? (
                          <video
                            src={story.mediaUrl}
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={story.mediaUrl}
                            alt={story.caption || 'Story'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}

                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1">
                          {story.mediaType === 'video' ? <Video size={10} /> : <ImageIcon size={10} />}
                          <span>{story.mediaType}</span>
                        </div>

                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          <button
                            onClick={() => startEditStory(story)}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-accent text-white hover:text-bg-primary backdrop-blur-md transition-colors cursor-pointer"
                            title="Edit Metadata Story (Jam, Tanggal, Caption)"
                          >
                            <Pencil size={13} />
                          </button>
                          {confirmDeleteStoryId === story.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  handleDeleteStory(story.id);
                                  setConfirmDeleteStoryId(null);
                                }}
                                className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-mono font-bold hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                              >
                                Hapus!
                              </button>
                              <button
                                onClick={() => setConfirmDeleteStoryId(null)}
                                className="p-1 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                                title="Batal"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteStoryId(story.id)}
                              className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors cursor-pointer"
                              title="Hapus Story Ini"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-3.5 flex flex-col justify-between flex-1">
                        <div>
                          <span className="text-[10px] font-mono text-text-dim block mb-1">
                            {new Date(story.timestamp).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <p className="text-xs text-text-primary line-clamp-2 font-medium">
                            {story.caption || <span className="text-text-dim italic">Tanpa caption</span>}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                          <button
                            onClick={() => startEditStory(story)}
                            className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Pencil size={11} />
                            <span>Edit Metadata</span>
                          </button>
                          <span className="text-[10px] font-mono text-text-dim">@{story.author || 'comeinone.f'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: GOD MODE (PUSAT KENDALI KONTEN WEBSITE) */}
        {activeTab === 'godmode' && (
          <div className="space-y-6">
            {/* Hero Header */}
            <div className="p-5 rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/10 via-purple-500/10 to-pink-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent font-mono text-xs mb-2">
                  <Globe size={13} />
                  <span>⚡ GOD MODE CONTROLLER</span>
                </div>
                <h2 className="text-lg font-heading font-bold text-text-primary">
                  Pusat Kendali Teks &amp; Media Website Kelas F
                </h2>
                <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
                  Ubah headline, subjudul, badge, deskripsi manifesto, angka statistik, foto mockup, dan tautan media sosial secara langsung. Setiap perubahan langsung aktif di homepage tanpa perlu menyentuh baris kode.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadGodContent}
                  disabled={isLoadingGodMode}
                  className="px-3 py-2 rounded-xl bg-bg-surface border border-border hover:border-accent/40 text-text-muted hover:text-accent text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={isLoadingGodMode ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() =>
                    handleDownloadJson(
                      JSON.stringify({ hero: godHero, manifesto: godManifesto, footer: godFooter }, null, 2),
                      'site-content.json'
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-bg-surface border border-border hover:border-accent/40 text-text-muted hover:text-accent text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Unduh backup data website"
                >
                  <Download size={13} />
                  <span>Backup JSON</span>
                </button>

                <button
                  onClick={handleSaveGodMode}
                  disabled={isSavingGodMode}
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.25)] disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSavingGodMode ? 'Menyimpan...' : 'Simpan Semua Konten'}</span>
                </button>
              </div>
            </div>

            {/* Cloud Sync & Persistence Alert */}
            <div className="p-4 rounded-2xl border border-border bg-bg-elevated/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-accent">
                <Sparkles size={14} />
                <span>Tips Penyimpanan Online &amp; Vercel Serverless</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Di lingkungan Vercel Serverless, perubahan disimpan ke memori dan cache <code className="text-accent font-mono">/tmp</code> secara aman (bebas error EROFS). Jika ingin perubahan permanen ke GitHub repo atau Hugging Face Dataset, kamu bisa menambahkan variabel lingkungan <code className="text-text-primary font-mono">HF_TOKEN</code> &amp; <code className="text-text-primary font-mono">HF_DATASET_REPO</code> di Vercel, atau cukup klik tombol <strong>Backup JSON</strong> untuk commit langsung ke repo Git kamu.
              </p>
            </div>

            {/* Form Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SECTION 1: HERO */}
              <div className="p-5 rounded-2xl border border-border bg-bg-elevated/50 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                  <h3 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wide">
                    1. Halaman Depan (Hero Section)
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Headline Baris 1
                    </label>
                    <input
                      type="text"
                      value={godHero.headlinePart1}
                      onChange={(e) => setGodHero({ ...godHero, headlinePart1: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                      placeholder="KELAS YANG ISINYA"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Headline Baris 2 (Warna Aksen)
                    </label>
                    <input
                      type="text"
                      value={godHero.headlinePart2}
                      onChange={(e) => setGodHero({ ...godHero, headlinePart2: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-accent font-bold focus:outline-none focus:border-accent"
                      placeholder="LITTLE LITTLE GAGAP."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Subjudul / Deskripsi Baris Bawah
                    </label>
                    <input
                      type="text"
                      value={godHero.subtitle}
                      onChange={(e) => setGodHero({ ...godHero, subtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                      placeholder="Computer Engineering — Class F"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                        Badge Kiri
                      </label>
                      <input
                        type="text"
                        value={godHero.badgeCode}
                        onChange={(e) => setGodHero({ ...godHero, badgeCode: e.target.value })}
                        className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                        placeholder="CE — F"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                        Badge Kanan
                      </label>
                      <input
                        type="text"
                        value={godHero.badgeLabel}
                        onChange={(e) => setGodHero({ ...godHero, badgeLabel: e.target.value })}
                        className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                        placeholder="TK-F POLMED"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      URL Foto Mockup Background
                    </label>
                    <input
                      type="text"
                      value={godHero.mockupImage}
                      onChange={(e) => setGodHero({ ...godHero, mockupImage: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
                      placeholder="/hero-mockup.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: MANIFESTO & STATISTIK */}
              <div className="p-5 rounded-2xl border border-border bg-bg-elevated/50 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wide">
                    2. Manifesto &amp; Statistik Kelas
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Tagline / Slogan Kelas
                    </label>
                    <input
                      type="text"
                      value={godManifesto.tagline}
                      onChange={(e) => setGodManifesto({ ...godManifesto, tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                      placeholder="Circuits, Code, and Chaos."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Paragraf Narasi Manifesto Kelas
                    </label>
                    <textarea
                      rows={3}
                      value={godManifesto.description}
                      onChange={(e) => setGodManifesto({ ...godManifesto, description: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent resize-none leading-relaxed"
                      placeholder="Deskripsi cerita dan visi perjalanan kelas F..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                        Jumlah Proyek Aktif
                      </label>
                      <input
                        type="number"
                        value={godManifesto.statProjects}
                        onChange={(e) =>
                          setGodManifesto({ ...godManifesto, statProjects: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                        Jam Praktikum (Hours)
                      </label>
                      <input
                        type="number"
                        value={godManifesto.statHours}
                        onChange={(e) =>
                          setGodManifesto({ ...godManifesto, statHours: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: FOOTER & SOSIAL */}
              <div className="p-5 rounded-2xl border border-border bg-bg-elevated/50 space-y-4 lg:col-span-2">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                  <h3 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wide">
                    3. Footer &amp; Tautan Sosial
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Catatan Hak Cipta / Footer Copyright
                    </label>
                    <input
                      type="text"
                      value={godFooter.copyright}
                      onChange={(e) => setGodFooter({ ...godFooter, copyright: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                      placeholder="Class F — Computer Engineering POLMED 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Link Akun Instagram Kelas
                    </label>
                    <input
                      type="text"
                      value={godFooter.instagramUrl}
                      onChange={(e) => setGodFooter({ ...godFooter, instagramUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                      placeholder="https://instagram.com/comeinone.f"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ABSENSI KELAS */}
        {activeTab === 'absensi' && <AdminAbsensiTab />}

        {/* TAB 4: ROADMAP SEKRETARIS & DEV */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-accent/30 bg-accent/5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent font-mono text-xs mb-2">
                <Sparkles size={13} />
                <span>SEKRETARIS & DEV ROADMAP</span>
              </div>
              <h2 className="text-lg font-heading font-bold text-text-primary">
                Modul Ekstensi Mendatang untuk Konsol Admin
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
                Sebagai sekretaris dan developer kelas CE F, portal ini dirancang modular sehingga kamu bisa terus menambahkan fitur-fitur administrasi kelas lainnya di masa mendatang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-bg-elevated/40 hover:border-border-accent/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                    <DollarSign size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    Kas Kelas F
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Pencatatan iuran kas bulanan, status lunas per mahasiswa, dan rekap pengeluaran kelas untuk keperluan praktikum/sosial.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-accent">Modul Keuangan</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-surface border border-border text-text-dim">
                    Coming Soon
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-bg-elevated/40 hover:border-border-accent/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                    <ClipboardList size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    Presensi & Absensi
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Sistem daftar hadir mata kuliah dan praktikum laboratorium CE F, surat izin sakit, serta rekap persentase kehadiran semester.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-blue-400">Modul Akademik</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-surface border border-border text-text-dim">
                    Coming Soon
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-bg-elevated/40 hover:border-border-accent/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                    <Calendar size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    Jadwal & Deadline Lab
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Countdown deadline pengumpulan laporan praktikum, jadwal kuis, serta pengingat agenda penting kelas CE F.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-purple-400">Modul Kalender</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-surface border border-border text-text-dim">
                    Coming Soon
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-bg-elevated/40 hover:border-border-accent/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                    <FolderArchive size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    Arsip & Template Dokumen
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Template surat permohonan, modul praktikum, slide presentasi kelas, dan arsip dokumen resmi sekretariat.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-400">Modul Berkas</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-surface border border-border text-text-dim">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL UPLOAD FOTO DENGAN DRAG & DROP ZONE & TOMBOL CROP --- */}
      <AnimatePresence>
        {activePhotoStudent && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full sm:max-w-md bg-bg-elevated border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <CropIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-text-primary">
                      Upload & Crop Foto Profil
                    </h3>
                    <p className="text-xs text-text-muted">
                      {activePhotoStudent.name} (ID #{activePhotoStudent.id})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePhotoStudent(null)}
                  className="p-1 rounded-lg text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Interactive Drag & Drop Area */}
              <div
                onDragOver={handleModalDragOver}
                onDragLeave={handleModalDragLeave}
                onDrop={handleModalDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none mb-4 ${
                  isModalDragging
                    ? 'border-accent bg-accent/20 scale-[1.02] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                    : 'border-border/80 bg-bg-surface/60 hover:border-accent/50 hover:bg-bg-surface'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Avatar Preview */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent/40 shadow-inner flex items-center justify-center bg-bg-primary text-xl font-heading font-bold text-accent mb-3 relative">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <PhotoAvatar student={activePhotoStudent} size="w-24 h-24" />
                  )}
                  {isModalDragging && (
                    <div className="absolute inset-0 bg-accent/40 backdrop-blur-xs flex items-center justify-center">
                      <Upload size={24} className="text-white animate-bounce" />
                    </div>
                  )}
                </div>

                <p className="text-xs font-heading font-semibold text-text-primary mb-1">
                  {selectedFile ? (
                    <span className="text-accent">{selectedFile.name} (Klik untuk Crop)</span>
                  ) : (
                    <span>Tarik & lepas foto ke sini untuk langsung di-Crop!</span>
                  )}
                </p>
                <p className="text-[11px] font-mono text-text-dim">
                  atau klik untuk browse dari galeri / kamera HP
                </p>
              </div>

              {/* Crop Existing Button (if student already has photo) */}
              {activePhotoStudent.photo && (
                <button
                  type="button"
                  onClick={() => startCropForStudent(activePhotoStudent, activePhotoStudent.photo!)}
                  className="w-full mb-3 py-2 px-3 rounded-xl border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CropIcon size={14} />
                  <span>Crop / Sesuaikan Ulang Foto Saat Ini</span>
                </button>
              )}

              {/* External URL Alternative */}
              <div className="space-y-2 mb-4">
                <div className="text-center text-[10px] font-mono text-text-dim">
                  — ATAU MASUKKAN URL GAMBAR —
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPhotoUrl}
                    onChange={(e) => {
                      setCustomPhotoUrl(e.target.value);
                      if (e.target.value) setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://... (link gambar online)"
                    className="flex-1 px-3.5 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
                  />
                  {customPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => startCropForStudent(activePhotoStudent, customPhotoUrl)}
                      className="px-3 py-2 bg-accent/20 border border-accent/40 text-accent rounded-xl text-xs font-mono hover:bg-accent hover:text-bg-primary transition-colors cursor-pointer"
                      title="Crop gambar dari URL"
                    >
                      <CropIcon size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePhotoStudent(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-heading font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePhotoDirect}
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Foto'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CROPPER MODAL INTERAKTIF --- */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperImageSrc}
        studentName={cropperStudent?.name || ''}
        studentId={cropperStudent?.id || ''}
        onClose={() => {
          setCropperOpen(false);
          setCropperImageSrc(null);
          setCropperStudent(null);
        }}
        onCropComplete={handleCropComplete}
        isSaving={isSaving}
      />

      {/* --- MODAL EDIT / TAMBAH MAHASISWA --- */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full sm:max-w-lg bg-bg-elevated border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-heading font-bold text-text-primary">
                  {isCreatingNew ? 'Tambah Mahasiswa Baru' : 'Edit Identitas Mahasiswa'}
                </h3>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="p-1 rounded-lg text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      ID Mahasiswa
                    </label>
                    <input
                      type="text"
                      value={editingStudent.id}
                      onChange={(e) => setEditingStudent({ ...editingStudent, id: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      NIM
                    </label>
                    <input
                      type="text"
                      value={editingStudent.nim}
                      onChange={(e) => setEditingStudent({ ...editingStudent, nim: e.target.value })}
                      required
                      placeholder="25051120xx"
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    required
                    placeholder="Nama lengkap mahasiswa"
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Peran / Jabatan
                    </label>
                    <select
                      value={editingStudent.role || 'Anggota'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, role: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="Komting">Komting</option>
                      <option value="Wakil Komting">Wakil Komting</option>
                      <option value="Sekretaris">Sekretaris</option>
                      <option value="Bendahara">Bendahara</option>
                      <option value="Anggota">Anggota</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Alias / Panggilan
                    </label>
                    <input
                      type="text"
                      value={editingStudent.alias || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, alias: e.target.value })}
                      placeholder="Nama panggilan akrab"
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Akun Instagram (Username / Link)
                  </label>
                  <input
                    type="text"
                    value={editingStudent.instagram || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, instagram: e.target.value })}
                    placeholder="@username atau link instagram"
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Kata-kata Mutiara / Quotes
                  </label>
                  <textarea
                    value={editingStudent.katakata || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, katakata: e.target.value })}
                    rows={2}
                    placeholder="Quotes atau kata-kata khas mahasiswa ini..."
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-heading font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    <Save size={14} />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL UPLOAD STORY MANUAL --- */}
      <AnimatePresence>
        {isStoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full sm:max-w-md bg-bg-elevated border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-text-primary">
                      Upload Arsip Story IG
                    </h3>
                    <p className="text-xs text-text-muted">
                      Foto atau Video (.jpg, .png, .mp4)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsStoryModalOpen(false)}
                  className="p-1 rounded-lg text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadStory} className="space-y-4">
                {/* Drag & Drop Media Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setStoryDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setStoryDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setStoryDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setStoryFile(file);
                      setStoryPreview(URL.createObjectURL(file));
                    }
                  }}
                  onClick={() => storyFileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    storyDragOver
                      ? 'border-rose-500 bg-rose-500/15 scale-[1.02]'
                      : 'border-border bg-bg-surface/50 hover:border-rose-500/50 hover:bg-bg-surface'
                  }`}
                >
                  <input
                    ref={storyFileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setStoryFile(file);
                        setStoryPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />

                  {storyPreview ? (
                    <div className="w-28 h-40 rounded-xl overflow-hidden mb-2 border border-border relative bg-black flex items-center justify-center">
                      {storyFile?.type.startsWith('video/') ? (
                        <video src={storyPreview} className="w-full h-full object-cover" />
                      ) : (
                        <img src={storyPreview} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
                      <Upload size={22} />
                    </div>
                  )}

                  <p className="text-xs font-heading font-semibold text-text-primary">
                    {storyFile ? storyFile.name : 'Tarik & lepas foto/video ke sini'}
                  </p>
                  <p className="text-[11px] font-mono text-text-dim mt-0.5">
                    Mendukung JPG, PNG, WebP, MP4, WebM
                  </p>
                </div>

                {/* Caption Input */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Caption Story (Opsional)
                  </label>
                  <textarea
                    value={storyCaption}
                    onChange={(e) => setStoryCaption(e.target.value)}
                    rows={2}
                    placeholder="Tulis caption story..."
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Kategori Story
                  </label>
                  <select
                    value={storyCategory}
                    onChange={(e) => setStoryCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="General">General</option>
                    <option value="Praktikum">Praktikum</option>
                    <option value="Kantin & Chill">Kantin & Chill</option>
                    <option value="Project IoT">Project IoT</option>
                    <option value="Event">Event</option>
                    <option value="Chaos">Chaos</option>
                  </select>
                </div>

                {/* Custom Date (Opsional) */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Waktu / Tanggal Story (Opsional)
                  </label>
                  <input
                    type="datetime-local"
                    value={storyDate}
                    onChange={(e) => setStoryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] font-mono text-text-dim mt-1">
                    Kosongkan untuk menggunakan waktu saat ini otomatis.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsStoryModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-heading font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingStory || !storyFile}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-rose-500/20"
                  >
                    <Save size={14} />
                    <span>{isUploadingStory ? 'Mengunggah...' : 'Simpan ke Arsip'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL EDIT METADATA STORY --- */}
      <AnimatePresence>
        {editingStory && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full sm:max-w-md bg-bg-elevated border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <Pencil size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-text-primary">
                      Edit Metadata Story
                    </h3>
                    <p className="text-[11px] text-text-muted font-mono truncate max-w-[240px]">
                      {editingStory.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingStory(null)}
                  className="p-1 rounded-lg text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Media Preview Box */}
              <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 bg-black border border-border flex items-center justify-center">
                {editingStory.mediaType === 'video' ? (
                  <video src={editingStory.mediaUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={editingStory.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white">
                  {editingStory.mediaType}
                </div>
              </div>

              <form onSubmit={handleSaveStoryMeta} className="space-y-3.5">
                {/* Waktu & Jam (Timestamp) */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1 flex items-center gap-1">
                    <Clock size={12} className="text-accent" />
                    <span>Waktu & Jam Posting (Timestamp)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={editTimestamp}
                    onChange={(e) => setEditTimestamp(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">
                    Ubah jam dan tanggal jika ingin menyesuaikan waktu asli saat story di-upload di Instagram.
                  </p>
                </div>

                {/* Caption Story */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Teks Caption
                  </label>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={2}
                    placeholder="Tulis caption untuk story ini..."
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                {/* Grid Author & Kategori */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Akun / Author
                    </label>
                    <input
                      type="text"
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      placeholder="comeinone.f"
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Kategori / Highlight
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="General">General</option>
                      <option value="Praktikum">Praktikum</option>
                      <option value="Kantin & Chill">Kantin & Chill</option>
                      <option value="Project IoT">Project IoT</option>
                      <option value="Event">Event</option>
                      <option value="Lab">Lab</option>
                    </select>
                  </div>
                </div>

                {/* Tipe Media Toggle */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Tipe Media
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditMediaType('image')}
                      className={`py-2 rounded-xl text-xs font-heading font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        editMediaType === 'image'
                          ? 'bg-accent/20 border-accent text-accent'
                          : 'bg-bg-surface border-border text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <ImageIcon size={14} />
                      <span>Foto (Image)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMediaType('video')}
                      className={`py-2 rounded-xl text-xs font-heading font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        editMediaType === 'video'
                          ? 'bg-accent/20 border-accent text-accent'
                          : 'bg-bg-surface border-border text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <Video size={14} />
                      <span>Video</span>
                    </button>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setEditingStory(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-heading font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingStoryMeta}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    <Save size={14} />
                    <span>{isSavingStoryMeta ? 'Menyimpan...' : 'Simpan Metadata'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL TAMBAH & EDIT PROYEK KELAS --- */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full sm:max-w-xl bg-bg-elevated border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <FolderGit2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-text-primary">
                      {isCreatingNewProject ? 'Tambah Proyek Karya Kelas' : `Edit Proyek: ${editingProject?.title}`}
                    </h3>
                    <p className="text-[11px] text-text-muted font-mono">
                      {isCreatingNewProject
                        ? 'Daftarkan karya baru untuk dipamerkan di What We Build'
                        : `ID: ${editingProject?.id}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProjectModalOpen(false)}
                  className="p-1 rounded-lg text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4">
                {/* Judul Proyek & Kategori */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Judul Proyek *
                    </label>
                    <input
                      type="text"
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      placeholder="Contoh: EnglishQuest, WABOT 2.0, Lab Monitor"
                      required
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Kategori *
                    </label>
                    <select
                      value={projCategory}
                      onChange={(e) => setProjCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Bot & Automation">Bot & Automation</option>
                      <option value="IoT & Robotics">IoT & Robotics</option>
                      <option value="Desktop & CLI">Desktop & CLI</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Game Development">Game Development</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Deskripsi Proyek */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Deskripsi Proyek & Fitur Unggulan *
                  </label>
                  <textarea
                    value={projDescription}
                    onChange={(e) => setProjDescription(e.target.value)}
                    rows={3}
                    placeholder="Jelaskan apa fungsi proyek ini, masalah apa yang diselesaikan, dan fitur-fitur inovatifnya..."
                    required
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent resize-none leading-relaxed"
                  />
                </div>

                {/* Tech Stack & Pembuat / Tim */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Tech Stack (Pisahkan Koma)
                    </label>
                    <input
                      type="text"
                      value={projTechStack}
                      onChange={(e) => setProjTechStack(e.target.value)}
                      placeholder="Next.js, TailwindCSS, TypeScript, Python"
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                    <p className="text-[10px] text-text-dim mt-1">Contoh: React, Vite, Node.js, Arduino</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Pembuat / Tim (Pisahkan Koma)
                    </label>
                    <input
                      type="text"
                      value={projTeam}
                      onChange={(e) => setProjTeam(e.target.value)}
                      placeholder="Ronn, Ahmad, Daffa"
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                    <p className="text-[10px] text-text-dim mt-1">Nama pembuat atau tim pengembang kelas</p>
                  </div>
                </div>

                {/* Links: Repository & Demo / WA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1 flex items-center gap-1">
                      <ExternalLink size={11} className="text-accent" />
                      <span>URL GitHub Repository</span>
                    </label>
                    <input
                      type="url"
                      value={projRepoUrl}
                      onChange={(e) => setProjRepoUrl(e.target.value)}
                      placeholder="https://github.com/ronnanakibu/..."
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1 flex items-center gap-1">
                      <Globe size={11} className="text-accent" />
                      <span>URL Live Demo / WhatsApp Bot</span>
                    </label>
                    <input
                      type="url"
                      value={projDemoUrl}
                      onChange={(e) => setProjDemoUrl(e.target.value)}
                      placeholder="https://... atau https://wa.me/..."
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Banner Image URL */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1 flex items-center gap-1">
                    <ImageIcon size={11} className="text-accent" />
                    <span>Path Gambar Banner (Rasio 16:9)</span>
                  </label>
                  <input
                    type="text"
                    value={projImage}
                    onChange={(e) => setProjImage(e.target.value)}
                    placeholder="/projects/nama-gambar.png"
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">
                    Simpan gambar di folder <span className="font-mono text-accent">public/projects/</span> lalu masukkan path seperti <span className="font-mono text-accent">/projects/englishquest.png</span>. Jika dibiarkan kosong, web otomatis menampilkan banner cybernetic elegan.
                  </p>
                </div>

                {/* Featured Checkbox */}
                <label className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between cursor-pointer hover:bg-amber-500/10 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Star size={16} className="text-amber-400" />
                    <div>
                      <span className="text-xs font-heading font-semibold text-text-primary block">
                        Jadikan Karya Unggulan (DEV'S PICK ⭐)
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Proyek akan disematkan di paling atas dengan lencana emas berkilau.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={projFeatured}
                    onChange={(e) => setProjFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-border cursor-pointer accent-amber-500"
                  />
                </label>

                {/* Modal Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-heading font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProject}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    <Save size={14} />
                    <span>
                      {isSavingProject
                        ? 'Menyimpan...'
                        : isCreatingNewProject
                        ? 'Tambah Proyek'
                        : 'Simpan Perubahan'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL TAMBAH & EDIT LAGU PLAYLIST --- */}
      <AnimatePresence>
        {isSongModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full sm:max-w-xl bg-bg-elevated border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <Music size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-text-primary">
                      {isCreatingNewSong
                        ? 'Tambah Lagu ke Playlist Kelas'
                        : `Edit Lagu: ${formSongTitle}`}
                    </h3>
                    <p className="text-[11px] text-text-muted font-mono">
                      {isCreatingNewSong
                        ? 'Cari lagu online untuk mengisi metadata cover & audio secara otomatis'
                        : `ID: ${editingSong?.id}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSongModalOpen(false)}
                  className="p-1 rounded-lg text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* SEARCH ENGINE SECTION (FOR AUTO-METADATA & AUDIO PROVIDER) */}
              <div className="mb-5 p-3.5 rounded-2xl bg-bg-surface/80 border border-accent/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-heading font-semibold text-accent flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Pilih Sumber / Provider Lagu:</span>
                  </label>
                  <span className="text-[10px] font-mono text-text-dim">
                    {musicSearchProvider === 'itunes'
                      ? 'Apple Music CDN'
                      : musicSearchProvider === 'youtube'
                      ? 'yt-dlp Engine'
                      : 'Lokal Device'}
                  </span>
                </div>

                {/* PROVIDER SELECTOR BUTTONS */}
                <div className="flex items-center gap-1.5 p-1 bg-bg-elevated rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setMusicSearchProvider('itunes');
                      setMusicSearchResults([]);
                      setSelectedYtTrack(null);
                      setTrimFeedback(null);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-heading font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      musicSearchProvider === 'itunes'
                        ? 'bg-accent text-bg-primary shadow-sm font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Music size={13} />
                    <span>Apple Music</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMusicSearchProvider('youtube');
                      setMusicSearchResults([]);
                      setSelectedYtTrack(null);
                      setTrimFeedback(null);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-heading font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      musicSearchProvider === 'youtube'
                        ? 'bg-red-500 text-white shadow-sm font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Video size={13} />
                    <span>YouTube (yt-dlp)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMusicSearchProvider('upload');
                      setMusicSearchResults([]);
                      setSelectedYtTrack(null);
                      setTrimFeedback(null);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-heading font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      musicSearchProvider === 'upload'
                        ? 'bg-purple-500 text-white shadow-sm font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Upload size={13} />
                    <span>Upload File</span>
                  </button>
                </div>

                {/* PROVIDER 1 & 2: SEARCH FORM */}
                {musicSearchProvider !== 'upload' && (
                  <form onSubmit={handleSearchMusicOnline} className="flex gap-2">
                    <input
                      type="text"
                      value={musicSearchQuery}
                      onChange={(e) => setMusicSearchQuery(e.target.value)}
                      placeholder={
                        musicSearchProvider === 'youtube'
                          ? 'Cari di YouTube (contoh: Hindia Evaluasi, NIKI, Bernadya)...'
                          : 'Cari di iTunes (contoh: Coldplay, NIKI, Hindia)...'
                      }
                      className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
                    />
                    <button
                      type="submit"
                      disabled={isSearchingMusic}
                      className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 ${
                        musicSearchProvider === 'youtube'
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                          : 'bg-accent hover:bg-accent/90 text-bg-primary'
                      }`}
                    >
                      <Search size={13} className={isSearchingMusic ? 'animate-spin' : ''} />
                      <span>{isSearchingMusic ? 'Mencari...' : 'Cari'}</span>
                    </button>
                  </form>
                )}

                {/* PROVIDER 3: UPLOAD FILE DIRECT */}
                {musicSearchProvider === 'upload' && (
                  <div className="p-4 rounded-xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5 text-center transition-colors">
                    <FileAudio size={24} className="mx-auto mb-2 text-purple-400" />
                    <p className="text-xs font-heading font-semibold text-text-primary mb-1">
                      Upload File Audio (MP3 / M4A / WAV)
                    </p>
                    <p className="text-[11px] text-text-muted font-mono mb-3">
                      Pilih file audio lagu dari perangkatmu untuk dijadikan preview audio.
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-heading font-semibold cursor-pointer transition-colors shadow-sm">
                      <Upload size={13} />
                      <span>Pilih File Dari Komputer/HP</span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAudioFileUpload(file);
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* Search Results Drawer */}
                {musicSearchResults.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/50 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                    <p className="text-[10px] font-mono text-text-dim">
                      Hasil Ditemukan ({musicSearchResults.length}) — Klik &ldquo;Pilih Lagu&rdquo; untuk mengisi form:
                    </p>
                    {musicSearchResults.map((track) => (
                      <div
                        key={track.id}
                        className="p-2 rounded-xl border border-border bg-bg-elevated hover:border-accent/50 transition-colors flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={track.coverUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover shrink-0 bg-black border border-border/50"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-heading font-semibold text-text-primary truncate">
                              {track.title}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted truncate">
                              <span>{track.artist}</span>
                              {track.durationText && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-text-dim">
                                  ⏱️ {track.durationText}
                                </span>
                              )}
                              {track.provider === 'youtube' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                                  YouTube
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectSearchResult(track)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-heading font-bold shrink-0 transition-colors cursor-pointer ${
                            track.provider === 'youtube'
                              ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                              : 'bg-accent hover:bg-accent/90 text-bg-primary'
                          }`}
                        >
                          Pilih Lagu
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* YOUTUBE 30-SECOND SELECTOR (AUDIO TRIMMER) */}
                {selectedYtTrack && (() => {
                  // Derive actual duration in seconds from durationText if durationSeconds is missing/0
                  const parseDurText = (txt?: string) => {
                    if (!txt) return 0;
                    // YouTube can return "6:33" or "6.33" — normalize both
                    const normalized = txt.trim().replace(/\./g, ':');
                    const parts = normalized.split(':').map(Number);
                    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
                    if (parts.length === 2) return parts[0] * 60 + parts[1];
                    return 0;
                  };
                  // Always prefer raw durationText parse — durationSeconds from API
                  // can be 180 (fallback) even when actual track is 6+ minutes.
                  const fromText = parseDurText(selectedYtTrack.durationText);
                  const trackDurationSec = fromText > 0
                    ? fromText
                    : (selectedYtTrack.durationSeconds > 0 ? selectedYtTrack.durationSeconds : 0);
                  const sliderMax = trackDurationSec > 30 ? trackDurationSec - 30 : 30;

                  return (
                  <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scissors size={14} className="text-red-400" />
                        <span className="text-xs font-heading font-bold text-red-400">
                          Seleksi 30 Detik Cuplikan (yt-dlp Trimmer)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-text-dim">
                        Durasi Asli: {selectedYtTrack.durationText || '3:30'}
                      </span>
                    </div>

                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Geser slider di bawah untuk memilih bagian 30 detik yang ingin dijadikan cuplikan lagu (misalnya bagian reff/chorus):
                    </p>

                    {/* Slider Range */}
                    <div className="space-y-1.5">
                      <input
                        type="range"
                        min={0}
                        max={sliderMax}
                        step={1}
                        value={ytStartSecond}
                        onChange={(e) => handleYtSliderChange(Number(e.target.value))}
                        className="w-full accent-red-500 cursor-pointer"
                      />

                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-red-400 font-semibold">
                          Mulai: {Math.floor(ytStartSecond / 60)}:{(ytStartSecond % 60).toString().padStart(2, '0')}
                        </span>
                        <span className="text-text-dim font-bold">Durasi: 30 Detik</span>
                        <span className="text-emerald-400 font-semibold">
                          Selesai: {Math.floor((ytStartSecond + 30) / 60)}:{((ytStartSecond + 30) % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-text-dim">Preset Cepat:</span>
                      {[
                        { label: 'Awal (00:00)', sec: 0 },
                        { label: 'Bait 1 (00:30)', sec: 30 },
                        { label: 'Reff 1 (01:00)', sec: 60 },
                        { label: 'Reff 2 (01:30)', sec: 90 },
                        { label: 'Bridge (02:00)', sec: 120 },
                      ].map((preset) => (
                        <button
                          key={preset.sec}
                          type="button"
                          onClick={() => setYtStartSecond(preset.sec)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                            ytStartSecond === preset.sec
                              ? 'bg-red-500 text-white font-bold'
                              : 'bg-white/5 text-text-muted hover:text-white border border-white/10'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* ── AUDIO PREVIEW PLAYER (Instagram-style) ── */}
                    <div className="pt-2 border-t border-red-500/20">
                      <div className="flex items-center gap-3">
                        {/* Play/Stop button */}
                        <button
                          type="button"
                          onClick={handleToggleYtPreview}
                          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                            isYtPreviewPlaying
                              ? 'bg-red-500 hover:bg-red-400 text-white'
                              : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/20'
                          }`}
                          title={isYtPreviewPlaying ? 'Stop Preview' : `Preview dari ${Math.floor(ytStartSecond/60)}:${(ytStartSecond%60).toString().padStart(2,'0')}`}
                        >
                          {isYtPreviewPlaying ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                              <rect x="1" y="1" width="4" height="10" rx="1"/>
                              <rect x="7" y="1" width="4" height="10" rx="1"/>
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                              <path d="M2 1.5l9 4.5-9 4.5z"/>
                            </svg>
                          )}
                        </button>

                        {/* Waveform bars + progress */}
                        <div className="flex-1 min-w-0 space-y-1">
                          {/* Animated waveform bars */}
                          <div className="flex items-end gap-[3px] h-7 overflow-hidden">
                            {Array.from({ length: 30 }).map((_, i) => {
                              const filled = isYtPreviewPlaying && i < ytPreviewElapsed;
                              const heights = [60,40,80,55,90,45,70,50,85,40,65,75,50,90,60,45,80,55,70,85,50,65,40,75,60,90,45,80,55,65];
                              return (
                                <div
                                  key={i}
                                  style={{ height: `${heights[i]}%` }}
                                  className={`flex-1 rounded-sm transition-colors duration-300 ${
                                    filled
                                      ? 'bg-red-400'
                                      : isYtPreviewPlaying && i === ytPreviewElapsed
                                      ? 'bg-white animate-pulse'
                                      : 'bg-white/20'
                                  } ${isYtPreviewPlaying && i === ytPreviewElapsed ? 'scale-y-110' : ''}`}
                                />
                              );
                            })}
                          </div>

                          {/* Progress track */}
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 rounded-full transition-all duration-1000"
                              style={{ width: isYtPreviewPlaying ? `${(ytPreviewElapsed / 30) * 100}%` : '0%' }}
                            />
                          </div>
                        </div>

                        {/* Timer + label */}
                        <div className="shrink-0 text-right">
                          {isYtPreviewPlaying ? (
                            <>
                              <p className="text-[11px] font-mono text-red-400 font-bold tabular-nums">
                                {ytPreviewElapsed}s / 30s
                              </p>
                              <p className="text-[10px] font-mono text-text-dim">Memutar...</p>
                            </>
                          ) : (
                            <>
                              <p className="text-[11px] font-mono text-text-dim">
                                {Math.floor(ytStartSecond/60)}:{(ytStartSecond%60).toString().padStart(2,'0')}
                              </p>
                              <p className="text-[10px] font-mono text-text-dim/60">Preview</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Hidden YouTube iframe for audio streaming */}
                      {isYtPreviewPlaying && selectedYtTrack?.videoId && (
                        <iframe
                          key={`yt-preview-${ytPreviewKey}`}
                          src={`https://www.youtube.com/embed/${selectedYtTrack.videoId}?start=${ytStartSecond}&autoplay=1&controls=0&mute=0&rel=0&modestbranding=1`}
                          allow="autoplay; encrypted-media"
                          sandbox="allow-scripts allow-same-origin allow-presentation"
                          width="0"
                          height="0"
                          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                        />
                      )}
                    </div>

                    {/* Bot Endpoint Toggle & Configuration */}
                    <div className="pt-2 border-t border-red-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleToggleBotEndpoint(!useBotEndpoint)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-heading font-medium transition-all cursor-pointer border ${
                            useBotEndpoint
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                              : 'bg-white/5 text-text-muted hover:text-white border-white/10 hover:border-white/20'
                          }`}
                        >
                          <Bot size={14} className={useBotEndpoint ? 'text-amber-400' : 'text-text-dim'} />
                          <span>🤖 Gunakan Bot Endpoint</span>
                          <span
                            className={`w-2 h-2 rounded-full transition-colors ${
                              useBotEndpoint
                                ? botPingStatus === 'online'
                                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                                  : 'bg-amber-400'
                                : 'bg-white/20'
                            }`}
                          />
                        </button>

                        {useBotEndpoint && botPingMessage && (
                          <span
                            className={`text-[11px] font-mono flex items-center gap-1 ${
                              botPingStatus === 'online' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {botPingStatus === 'online' ? <Check size={12} /> : <AlertCircle size={12} />}
                            {botPingMessage}
                          </span>
                        )}
                      </div>

                      {/* Expandable Bot Endpoint Setting Card */}
                      <AnimatePresence>
                        {useBotEndpoint && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-mono text-amber-400/90 font-medium flex items-center gap-1.5">
                                  <Radio size={12} />
                                  <span>URL Server Bot WABOT 2.0 / Audio Endpoint</span>
                                </label>
                                <span className="text-[10px] font-mono text-text-dim">Auto-saved</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={botEndpointUrl}
                                  onChange={(e) => handleUpdateBotUrl(e.target.value)}
                                  placeholder="http://ap1.nzb.zelpstore.id:25637"
                                  className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white placeholder:text-text-dim/50 focus:outline-none focus:border-amber-500/60"
                                />
                                <button
                                  type="button"
                                  onClick={handleTestBotPing}
                                  disabled={isTestingBotPing || !botEndpointUrl.trim()}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-heading font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                                >
                                  <RefreshCw size={12} className={isTestingBotPing ? 'animate-spin' : ''} />
                                  <span>{isTestingBotPing ? 'Testing...' : 'Tes Ping'}</span>
                                </button>
                              </div>

                              {/* Quick Presets */}
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <span className="text-[10px] font-mono text-text-dim">Preset Host:</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBotUrl('http://ap1.nzb.zelpstore.id:25637')}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/10 cursor-pointer"
                                >
                                  Pterodactyl (ap1.nzb:25637)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBotUrl('http://localhost:25637')}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/10 cursor-pointer"
                                >
                                  Localhost:25637
                                </button>
                              </div>

                              <p className="text-[10px] text-text-dim leading-relaxed">
                                Audio 30 detik YouTube akan di-stream dan dipotong langsung oleh Node.js & FFmpeg bot kamu tanpa batas kuota Hugging Face Space.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Action Button & Feedback */}
                    <div className="pt-2 border-t border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleTrimYouTubeAudio}
                        disabled={isTrimmingAudio}
                        className={`px-3 py-2 rounded-xl text-white text-xs font-heading font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 ${
                          useBotEndpoint
                            ? 'bg-amber-600 hover:bg-amber-500'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        <Scissors size={13} className={isTrimmingAudio ? 'animate-spin' : ''} />
                        <span>
                          {isTrimmingAudio
                            ? useBotEndpoint
                              ? 'Memproses via Bot Server...'
                              : 'Memotong Audio 30 Detik...'
                            : useBotEndpoint
                            ? '⚡ Potong via Bot Endpoint'
                            : '⚡ Potong 30 Detik Ini (yt-dlp)'}
                        </span>
                      </button>

                      {trimFeedback && (
                        <span className="text-[11px] font-mono text-text-dim max-w-xs leading-tight">
                          {trimFeedback}
                        </span>
                      )}
                    </div>
                  </div>
                  );
                })()}
              </div>

              {/* FORM FIELDS */}
              <form onSubmit={handleSaveSong} className="space-y-4">
                {/* Judul & Artis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Judul Lagu *
                    </label>
                    <input
                      type="text"
                      value={formSongTitle}
                      onChange={(e) => setFormSongTitle(e.target.value)}
                      placeholder="Contoh: High School in Jakarta"
                      required
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Nama Penyanyi / Artis *
                    </label>
                    <input
                      type="text"
                      value={formSongArtist}
                      onChange={(e) => setFormSongArtist(e.target.value)}
                      placeholder="Contoh: NIKI, Hindia, Queen"
                      required
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Album & Kategori */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Nama Album
                    </label>
                    <input
                      type="text"
                      value={formSongAlbum}
                      onChange={(e) => setFormSongAlbum(e.target.value)}
                      placeholder="Contoh: Nicole"
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Kategori Vibe
                    </label>
                    <select
                      value={formSongCategory}
                      onChange={(e) => setFormSongCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="Class Anthem">Class Anthem (Lagu Kebangsaan)</option>
                      <option value="Chill & Study">Chill &amp; Study (Teman Ngoding)</option>
                      <option value="Lab Anthem">Lab Anthem (Begadang Praktikum)</option>
                      <option value="Galau Praktikum">Galau Praktikum (Revisi Laporan)</option>
                      <option value="Road Trip">Road Trip (Pulang Bareng)</option>
                      <option value="Semangat Coding">Semangat Coding (High Energy)</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                {/* Perekomendasi / Pemilih Lagu */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Direkomendasikan Oleh (Mahasiswa) *
                  </label>
                  <div className="space-y-2">
                    <select
                      value={formSongSuggestedBy}
                      onChange={(e) => setFormSongSuggestedBy(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="Lagu Kebangsaan Kelas F">Lagu Kebangsaan Kelas F (Class Anthem)</option>
                      <option value="Kelas F Sound Lab">Kelas F Sound Lab</option>
                      <option disabled>────────── MAHASISWA KELAS F ──────────</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.alias || s.role || 'Mahasiswa'})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={formSongSuggestedBy}
                      onChange={(e) => setFormSongSuggestedBy(e.target.value)}
                      placeholder="Atau ketik nama kustom..."
                      className="w-full px-3 py-1.5 bg-bg-surface/50 border border-border/70 rounded-xl text-xs text-text-muted focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Catatan / Kenangan Lagu */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Catatan Kenangan Lagu (Opsional)
                  </label>
                  <textarea
                    value={formSongNote}
                    onChange={(e) => setFormSongNote(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Lagu yang sering diputar pas jam 9 malam pas nugas modul mikrokontroler di lab..."
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent resize-none leading-relaxed"
                  />
                </div>

                {/* Cover URL & Audio Preview URL */}
                <div className="space-y-3 p-3 rounded-2xl bg-bg-surface/50 border border-border">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      URL Cover Artwork (HD 600x600) *
                    </label>
                    <div className="flex items-center gap-2">
                      {formSongCoverUrl && (
                        <img
                          src={formSongCoverUrl}
                          alt="Cover"
                          className="w-9 h-9 rounded-lg object-cover shrink-0 border border-border"
                        />
                      )}
                      <input
                        type="url"
                        value={formSongCoverUrl}
                        onChange={(e) => setFormSongCoverUrl(e.target.value)}
                        placeholder="https://.../600x600bb.jpg"
                        required
                        className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      URL Audio Preview (Stream 30s)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={formSongAudioUrl}
                        onChange={(e) => setFormSongAudioUrl(e.target.value)}
                        placeholder="https://audio-ssl.itunes.apple.com/...m4a"
                        className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                      />
                      {formSongAudioUrl && (
                        <button
                          type="button"
                          onClick={() => toggleAdminAudioPreview('test', formSongAudioUrl)}
                          className="px-3 py-2 rounded-xl bg-bg-surface border border-accent/40 text-accent text-xs font-mono flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Play size={12} />
                          <span>Tes Suara</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Links: Spotify */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    URL Spotify Track (Opsional)
                  </label>
                  <input
                    type="url"
                    value={formSongSpotifyUrl}
                    onChange={(e) => setFormSongSpotifyUrl(e.target.value)}
                    placeholder="https://open.spotify.com/track/..."
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setIsSongModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-heading font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSong}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    <Save size={14} />
                    <span>
                      {isSavingSong
                        ? 'Menyimpan...'
                        : isCreatingNewSong
                        ? 'Tambah Lagu'
                        : 'Simpan Perubahan'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL EDIT / TAMBAH SLIDE THE JOURNEY --- */}
      <AnimatePresence>
        {isSlideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-bg-elevated border border-border-accent/40 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-heading font-bold">
                      {isCreatingNewSlide ? 'Tambah Milestone / Slide Baru' : 'Edit Slide The Journey'}
                    </h3>
                    <p className="text-[11px] font-mono text-text-muted">
                      Dokumentasi sejarah & momen perjalanan kelas F
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-bg-surface text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveSlide} className="space-y-4">
                {/* Title & Subtitle */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Judul Slide *
                    </label>
                    <input
                      type="text"
                      value={slideTitle}
                      onChange={(e) => setSlideTitle(e.target.value)}
                      placeholder="Contoh: The Beginning: Orientasi"
                      required
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Subjudul / Tagline Singkat
                    </label>
                    <input
                      type="text"
                      value={slideSubtitle}
                      onChange={(e) => setSlideSubtitle(e.target.value)}
                      placeholder="Contoh: Titik temu 30 kepala di Politeknik Negeri Medan"
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Metadata: Tag, Semester, Date */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Tag / Kategori
                    </label>
                    <input
                      type="text"
                      value={slideTag}
                      onChange={(e) => setSlideTag(e.target.value)}
                      placeholder="Orientation"
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Semester
                    </label>
                    <select
                      value={slideSemester}
                      onChange={(e) => setSlideSemester(Number(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    >
                      {[1, 2, 3, 4, 5, 6].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      Tanggal / Waktu
                    </label>
                    <input
                      type="text"
                      value={slideDate}
                      onChange={(e) => setSlideDate(e.target.value)}
                      placeholder="Sep 2024"
                      className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Media Type & URL */}
                <div className="space-y-3 p-3 rounded-2xl bg-bg-surface/50 border border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                        Tipe Media
                      </label>
                      <select
                        value={slideMediaType}
                        onChange={(e) => setSlideMediaType(e.target.value as 'image' | 'video')}
                        className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                      >
                        <option value="image">Gambar / Foto (Image)</option>
                        <option value="video">Video MP4 / WebM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                        Aksen Warna
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={slideAccentColor}
                          onChange={(e) => setSlideAccentColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={slideAccentColor}
                          onChange={(e) => setSlideAccentColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                      URL Media (Gambar / Video) *
                    </label>
                    <input
                      type="text"
                      value={slideMediaUrl}
                      onChange={(e) => setSlideMediaUrl(e.target.value)}
                      placeholder="/gallery/slide-orientation.jpg atau https://..."
                      required
                      className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                    <p className="text-[10px] font-mono text-text-dim mt-1">
                      Gunakan path lokal di /gallery/... atau link gambar online langsung (Unsplash, Cloudinary, dll).
                    </p>
                  </div>
                </div>

                {/* Deskripsi / Kisah Slide */}
                <div>
                  <label className="block text-[11px] font-mono text-text-dim uppercase mb-1">
                    Deskripsi / Cerita Milestone *
                  </label>
                  <textarea
                    value={slideDescription}
                    onChange={(e) => setSlideDescription(e.target.value)}
                    rows={4}
                    placeholder="Ceritakan momen ini secara sinematik..."
                    required
                    className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent resize-none leading-relaxed"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setIsSlideModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-heading font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSlide}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    <Save size={14} />
                    <span>
                      {isSavingSlide
                        ? 'Menyimpan...'
                        : isCreatingNewSlide
                        ? 'Tambah Slide'
                        : 'Simpan Perubahan'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- TOAST NOTIFICATIONS --- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-mono ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-300'
                : 'bg-bg-elevated/95 border-border-accent text-accent'
            } backdrop-blur-md`}
          >
            {toast.type === 'success' ? (
              <Check size={16} className="text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle size={16} className="text-red-400" />
            ) : (
              <Sparkles size={16} className="text-accent" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for Avatar with strict initials validation
function PhotoAvatar({ student, size = 'w-12 h-12' }: { student: Student; size?: string }) {
  const hue = stringToHue(student.name);
  const hasPhoto = Boolean(student.photo && student.photo.trim() !== '');
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoadError(false);
    setLoaded(false);
  }, [student.photo]);

  const showImg = hasPhoto && !loadError;

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center font-heading font-bold text-xs shrink-0 overflow-hidden border border-border shadow-inner select-none relative`}
      style={{
        backgroundColor: `hsl(${hue}, 40%, 18%)`,
        color: `hsl(${hue}, 60%, 68%)`,
      }}
    >
      {(!showImg || !loaded) && (
        <span className="font-heading font-bold tracking-wider select-none">
          {getInitials(student.name)}
        </span>
      )}
      {showImg && (
        <img
          key={student.photo}
          src={student.photo}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoadError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
