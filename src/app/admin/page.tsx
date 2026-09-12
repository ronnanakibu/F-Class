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
} from 'lucide-react';
import { getInitials, stringToHue } from '@/lib/utils';
import ImageCropperModal from '@/components/ImageCropperModal';
import type { IGStory, Project, Song } from '@/types';

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

  // Active Tab: 'photos' | 'students' | 'projects' | 'music' | 'stories' | 'json' | 'roadmap'
  const [activeTab, setActiveTab] = useState<'photos' | 'students' | 'projects' | 'music' | 'stories' | 'json' | 'roadmap'>('photos');

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

  // Music Auto-Search State
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [musicSearchResults, setMusicSearchResults] = useState<any[]>([]);

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

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadStories();
      loadProjects();
      loadSongs();
    }
  }, [isAuthenticated, loadData, loadStories, loadProjects, loadSongs]);

  const handleUploadStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyFile) {
      showToast('Pilih file media foto atau video terlebih dahulu', 'error');
      return;
    }
    setIsUploadingStory(true);
    try {
      const formData = new FormData();
      formData.append('file', storyFile);
      formData.append('apiKey', DEFAULT_PASSKEY);
      if (storyCaption.trim()) formData.append('caption', storyCaption.trim());
      if (storyDate) formData.append('timestamp', storyDate);

      const res = await fetch('/api/stories', {
        method: 'POST',
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
    if (!confirm('Yakin ingin menghapus arsip story ini? File media akan dihapus permanen.')) return;
    try {
      const res = await fetch(`/api/stories?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': DEFAULT_PASSKEY },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Story berhasil dihapus dari arsip', 'success');
        await loadStories();
      } else {
        showToast(data.error || 'Gagal menghapus story', 'error');
      }
    } catch {
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
      const res = await fetch('/api/stories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': DEFAULT_PASSKEY,
        },
        body: JSON.stringify({
          id: editingStory.id,
          caption: editCaption,
          timestamp: editTimestamp ? new Date(editTimestamp).toISOString() : editingStory.timestamp,
          author: editAuthor,
          category: editCategory,
          mediaType: editMediaType,
          apiKey: DEFAULT_PASSKEY,
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
        apiKey: DEFAULT_PASSKEY,
      };

      const method = isCreatingNewProject ? 'POST' : 'PUT';
      const res = await fetch('/api/projects', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': DEFAULT_PASSKEY,
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
    if (!confirm(`Hapus proyek "${title}" secara permanen dari portofolio?`)) return;

    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': DEFAULT_PASSKEY,
        },
        body: JSON.stringify({ id, apiKey: DEFAULT_PASSKEY }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(`Proyek "${title}" berhasil dihapus`, 'success');
        await loadProjects();
      } else {
        showToast(json.error || 'Gagal menghapus proyek', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat menghapus proyek', 'error');
    }
  };

  const handleToggleFeatured = async (proj: Project) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': DEFAULT_PASSKEY,
        },
        body: JSON.stringify({
          ...proj,
          featured: !proj.featured,
          apiKey: DEFAULT_PASSKEY,
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
    try {
      const isUrl = musicSearchQuery.includes('http');
      const param = isUrl
        ? `url=${encodeURIComponent(musicSearchQuery.trim())}`
        : `q=${encodeURIComponent(musicSearchQuery.trim())}`;
      const res = await fetch(`/api/music/search?${param}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setMusicSearchResults(data.results);
        if (data.results.length === 0) {
          showToast('Tidak ada lagu ditemukan. Coba judul atau artis lain.', 'info');
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
    setFormSongAudioUrl(track.audioUrl || '');
    setFormSongSpotifyUrl(track.spotifyUrl || '');
    setFormSongAppleMusicUrl(track.appleMusicUrl || '');
    showToast(`Metadata "${track.title}" berhasil disinkronkan otomatis!`, 'success');
  };

  const openCreateSongModal = () => {
    setEditingSong(null);
    setIsCreatingNewSong(true);
    setMusicSearchQuery('');
    setMusicSearchResults([]);
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
    setMusicSearchQuery('');
    setMusicSearchResults([]);
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
        apiKey: DEFAULT_PASSKEY,
      };

      const method = isCreatingNewSong ? 'POST' : 'PUT';
      const res = await fetch('/api/songs', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': DEFAULT_PASSKEY,
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
    if (!confirm(`Hapus lagu "${title}" dari playlist kelas?`)) return;

    try {
      const res = await fetch(`/api/songs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': DEFAULT_PASSKEY,
        },
        body: JSON.stringify({ id, apiKey: DEFAULT_PASSKEY }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(`Lagu "${title}" berhasil dihapus`, 'success');
        if (adminPlayingAudioId === id && adminAudioRef.current) {
          adminAudioRef.current.pause();
          setAdminPlayingAudioId(null);
        }
        await loadSongs();
      } else {
        showToast(json.error || 'Gagal menghapus lagu', 'error');
      }
    } catch {
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
    if (passkeyInput.toLowerCase().trim() === DEFAULT_PASSKEY || passkeyInput.trim() === 'ronn') {
      sessionStorage.setItem('cef_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cef_admin_auth');
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
      const formData = new FormData();
      formData.append('id', String(cropperStudent.id));
      formData.append('file', croppedBlob, `${cropperStudent.id}.jpg`);

      const res = await fetch('/api/admin/photo', {
        method: 'POST',
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

  const handleSavePhotoDirect = async () => {
    if (!activePhotoStudent) return;
    setIsSaving(true);

    try {
      if (customPhotoUrl.trim()) {
        const res = await fetch('/api/admin/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: activePhotoStudent.id,
            photoUrl: customPhotoUrl.trim(),
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
    if (!confirm(`Hapus foto untuk ${student.name}? Kartu akan kembali menggunakan inisial.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/photo?id=${student.id}`, { method: 'DELETE' });
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

      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    if (!confirm(`Yakin ingin menghapus ${student.name} (${student.nim}) dari daftar kelas?`)) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedList = students.filter((s) => s.id !== student.id);
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-bg-elevated border border-border rounded-2xl mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-accent text-bg-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <Camera size={15} />
            <span>Foto Profil & Crop</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-accent text-bg-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <Users size={15} />
            <span>Identitas JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 min-w-[125px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-accent text-bg-primary shadow-sm'
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
                ? 'bg-accent text-bg-primary shadow-sm'
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
                ? 'bg-accent text-bg-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <Sparkles size={15} />
            <span>Arsip Story IG</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'json'
                ? 'bg-accent text-bg-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <FileCode size={15} />
            <span>Raw Code</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-accent text-bg-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
            }`}
          >
            <Sparkles size={15} />
            <span>Next Fitur 🚀</span>
          </button>
        </div>

        {/* TAB 1: KELOLA FOTO MAHASISWA & DRAG N DROP DENGAN CROP */}
        {activeTab === 'photos' && (
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
                    <span>Batch Drag & Drop Foto</span>
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
                  placeholder="Cari mahasiswa untuk ganti / crop foto..."
                  className="w-full pl-9 pr-8 py-2 bg-bg-elevated border border-border rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-primary"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Roles Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-colors cursor-pointer ${
                      roleFilter === r
                        ? 'bg-accent/15 border border-accent/40 text-accent font-semibold'
                        : 'bg-bg-surface border border-border text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Photo Grid with Individual Card Drag & Drop + Crop Trigger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredStudents.map((s) => {
                const isTarget = draggingCardId === s.id;
                const hasCustomPhoto = Boolean(s.photo && s.photo.trim() !== '');

                return (
                  <div
                    key={s.id}
                    onDragOver={(e) => handleCardDragOver(e, s.id)}
                    onDragLeave={handleCardDragLeave}
                    onDrop={(e) => handleCardDrop(e, s)}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                      isTarget
                        ? 'border-accent bg-accent/15 scale-[1.02] shadow-[0_0_20px_rgba(0,240,255,0.3)] ring-2 ring-accent'
                        : 'border-border bg-bg-elevated/50 hover:border-border-accent/60'
                    }`}
                  >
                    {/* Drag overlay feedback */}
                    {isTarget && (
                      <div className="absolute inset-0 z-20 bg-bg-primary/95 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center pointer-events-none animate-fade-in">
                        <CropIcon size={26} className="text-accent animate-bounce mb-1.5" />
                        <p className="text-xs font-heading font-bold text-accent">
                          Drop foto untuk sesuaikan crop {s.name}!
                        </p>
                        <p className="text-[10px] font-mono text-text-dim mt-0.5">
                          ID #{s.id}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      {/* Avatar with strict initials validation */}
                      <PhotoAvatar student={s} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bg-surface border border-border text-text-dim">
                            #{s.id}
                          </span>
                          {hasCustomPhoto ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              FOTO AKTIF
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-bg-surface border border-border text-text-dim">
                              INISIAL
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-heading font-semibold text-text-primary truncate">
                          {s.name}
                        </h3>
                        <p className="text-[11px] font-mono text-text-muted">
                          {s.nim}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons with Crop Tool */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/40">
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
                        <button
                          onClick={() => handleDeletePhoto(s)}
                          className="p-2 rounded-xl border border-border hover:border-red-500/40 hover:bg-red-500/10 text-text-dim hover:text-red-400 transition-colors cursor-pointer"
                          title="Reset Foto ke Inisial"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: IDENTITAS / FORM MAHASISWA */}
        {activeTab === 'students' && (
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
                  className="px-3.5 py-2 rounded-xl bg-accent text-bg-primary text-xs font-heading font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Baru</span>
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

                    <h3 className="font-heading font-semibold text-base text-text-primary">
                      {s.name}
                    </h3>

                    {s.alias && (
                      <p className="text-xs text-text-muted mt-0.5">
                        <span className="text-text-dim font-mono">Alias:</span> {s.alias}
                      </p>
                    )}

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
                      Edit Data
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s)}
                      className="p-2 rounded-xl border border-border hover:border-red-500/40 hover:bg-red-500/10 text-text-dim hover:text-red-400 transition-colors cursor-pointer"
                      title="Hapus Mahasiswa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
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

                            <button
                              onClick={() => handleDeleteProject(proj.id, proj.title)}
                              className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                              title="Hapus Proyek"
                            >
                              <Trash2 size={13} />
                            </button>
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

                          <button
                            onClick={() => handleDeleteSong(song.id, song.title)}
                            className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                            title="Hapus Lagu"
                          >
                            <Trash2 size={13} />
                          </button>
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
                          <button
                            onClick={() => handleDeleteStory(story.id)}
                            className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors cursor-pointer"
                            title="Hapus Story Ini"
                          >
                            <Trash2 size={13} />
                          </button>
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

        {/* TAB 3: RAW JSON CODE EDITOR */}
        {activeTab === 'json' && (
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-heading font-semibold text-text-primary">
                  Editor Berkas data mahasiswa.json
                </h3>
                <p className="text-xs text-text-muted">
                  Edit langsung baris kode JSON. Perubahan akan langsung menulis file sistem.
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

              {/* SEARCH ENGINE SECTION (FOR AUTO-METADATA) */}
              <div className="mb-5 p-3.5 rounded-2xl bg-bg-surface/80 border border-accent/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-heading font-semibold text-accent flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Cari Lagu Online (Auto-Fetch Metadata &amp; Audio Preview)</span>
                  </label>
                  <span className="text-[10px] font-mono text-text-dim">iTunes &amp; Spotify</span>
                </div>

                <form onSubmit={handleSearchMusicOnline} className="flex gap-2">
                  <input
                    type="text"
                    value={musicSearchQuery}
                    onChange={(e) => setMusicSearchQuery(e.target.value)}
                    placeholder="Ketik judul lagu, penyanyi, atau link Spotify..."
                    className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingMusic}
                    className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Search size={13} className={isSearchingMusic ? 'animate-spin' : ''} />
                    <span>{isSearchingMusic ? 'Mencari...' : 'Cari'}</span>
                  </button>
                </form>

                {/* Search Results Drawer */}
                {musicSearchResults.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/50 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    <p className="text-[10px] font-mono text-text-dim">
                      Hasil Ditemukan ({musicSearchResults.length}) — Klik &ldquo;Gunakan Lagu Ini&rdquo; untuk mengisi form otomatis:
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
                            className="w-9 h-9 rounded-lg object-cover shrink-0 bg-black"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-heading font-semibold text-text-primary truncate">
                              {track.title}
                            </p>
                            <p className="text-[11px] font-mono text-text-muted truncate">
                              {track.artist} {track.album ? `• ${track.album}` : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectSearchResult(track)}
                          className="px-2.5 py-1.5 rounded-lg bg-accent text-bg-primary text-[10px] font-heading font-bold shrink-0 hover:bg-accent/90 transition-colors cursor-pointer"
                        >
                          Gunakan Lagu Ini
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
          src={student.photo}
          alt=""
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
