'use client';

import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { students as staticStudents } from '@/data/students';
import type { Student } from '@/types';
import FilterBar from './FilterBar';
import StudentCard from './StudentCard';
import SectionReveal from './SectionReveal';

export default function Students() {
  const [studentList, setStudentList] = useState<Student[]>(staticStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Pull live synced data from cloud/Hugging Face on mount
  useEffect(() => {
    fetch('/api/admin/students')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const mapped: Student[] = resData.data.map((item: any) => ({
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
          setStudentList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Dynamic role categories based on live data
  const categories = useMemo(() => {
    const rawRoles = Array.from(new Set(studentList.map((s) => s.role).filter(Boolean))) as string[];
    const priority = ['Komting', 'Wakil Komting', 'Sekretaris', 'Bendahara', 'Anggota'];
    rawRoles.sort((a, b) => {
      const idxA = priority.indexOf(a);
      const idxB = priority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    return ['All', ...rawRoles];
  }, [studentList]);

  // Filter students
  const filtered = useMemo(() => {
    return studentList.filter((student) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        student.name.toLowerCase().includes(q) ||
        student.nim.includes(q) ||
        (student.alias?.toLowerCase().includes(q) ?? false) ||
        (student.nickname?.toLowerCase().includes(q) ?? false) ||
        (student.role?.toLowerCase().includes(q) ?? false) ||
        (student.katakata?.toLowerCase().includes(q) ?? false);

      const matchesCategory =
        activeCategory === 'All' ||
        student.role === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [studentList, searchQuery, activeCategory]);

  return (
    <section id="students" className="py-24 md:py-32 relative">
      <div className="container-custom">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase mb-4">
            Who's in our class?
          </p>
          <h2 className="text-fluid-heading font-heading font-bold text-text-primary mb-4">
            Teman Teman {' '}
            <span className="text-accent">yang Mengisi Kelas Ini.</span>
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            placeholder="Search by name, NIM, or alias..."
          />
        </SectionReveal>

        {/* Students Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((student, i) => (
              <StudentCard
                key={student.id}
                student={student}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-dim font-mono text-sm">
              No students match &ldquo;{searchQuery}&rdquo;
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
