import type { Student } from '@/types';
import rawData from '../../data mahasiswa.json';

interface RawStudentItem {
  id: number | string;
  name: string;
  nim: string;
  alias?: string;
  nickname?: string;
  role?: string;
  instagram?: string;
  katakata?: string;
  quote?: string;
  photo?: string;
  interests?: string[];
  skills?: string[];
  socials?: {
    github?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export const students: Student[] = (rawData as RawStudentItem[]).map((item) => ({
  id: String(item.id),
  name: item.name,
  nim: item.nim,
  alias: item.alias,
  nickname: item.alias || item.nickname || '',
  role: item.role || 'Anggota',
  instagram: item.instagram || item.socials?.instagram || '',
  katakata: item.katakata,
  quote: item.katakata || item.quote || '',
  photo: item.photo,
  interests: item.interests || [],
  skills: item.skills || [],
  socials: {
    ...item.socials,
    instagram: item.instagram || item.socials?.instagram || '',
  },
}));

