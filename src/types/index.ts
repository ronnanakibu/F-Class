export interface Student {
  id: string | number;
  name: string;
  nim: string;
  alias?: string;
  nickname?: string;
  role?: string;
  photo?: string;
  instagram?: string;
  katakata?: string;
  quote?: string;
  interests?: string[];
  skills?: string[];
  socials?: {
    github?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface Memory {
  id: string;
  title: string;
  date: string;
  category: 'Practicum' | 'Campus' | 'Chaos' | 'Event';
  image: string;
  caption: string;
}

export interface Project {
  id: string;
  title: string;
  category: 'Embedded' | 'IoT' | 'Hardware' | 'Web' | 'AI';
  description: string;
  techStack: string[];
  team: string[];
  repoUrl?: string;
  demoUrl?: string;
  image?: string;
  featured?: boolean;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  semester: number;
  description: string;
  icon: string;
}

export interface ClassInfo {
  className: string;
  classCode: string;
  tagline: string;
  department: string;
  institution: string;
  batch: string;
  year: number;
  description: string;
  socials: {
    instagram?: string;
    github?: string;
    whatsapp?: string;
  };
  stats: {
    totalStudents: number;
    activeProjects: number;
    practicumHours: number;
  };
}

export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  semester: number;
  tag: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  accentColor?: string;
}

export interface IGStory {
  id: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: 'image' | 'video';
  caption?: string;
  timestamp: string;
  author?: string;
  category?: string;
  igStoryId?: string;
  source?: string;
  likes?: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl: string;
  audioUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  suggestedBy: string;
  studentId?: string | number;
  note?: string;
  category?: string;
  addedAt: string;
}

