export interface Student {
  id: string;
  name: string;
  nim: string;
  nickname?: string;
  role?: string;
  photo?: string;
  quote?: string;
  interests: string[];
  skills: string[];
  socials: {
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
