import type { ClassInfo } from '@/types';
import { students } from './students';

export const classInfo: ClassInfo = {
  className: 'Class F',
  classCode: 'CE — F',
  tagline: 'Circuits, Code, and Chaos.',
  department: 'Jurusan Teknik Komputer dan Informatika (KI)',
  institution: 'Politeknik Negeri Medan',
  batch: 'Angkatan 2025',
  year: 2025,
  description:
    'Kami adalah kelas F dari Program Studi Teknik Komputer Politeknik Negeri Medan, Angkatan 2025. Datang dari berbagai daerah dan disatukan di sini, kami punya satu tujuan: belajar bertumbuh, dan merintis jalan menuju masa depan yang kami impikan.',
  socials: {
    instagram: 'https://instagram.com/comeinone.f'
  },
  stats: {
    totalStudents: students.length,
    activeProjects: 12,
    practicumHours: 1440,
  },
};
