'use client';

import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { students } from '@/data/students';
import FilterBar from './FilterBar';
import StudentCard from './StudentCard';
import StudentModal from './StudentModal';
import SectionReveal from './SectionReveal';
import type { Student } from '@/types';

export default function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Curated broad categories (instead of every individual interest)
  const categories = ['All', 'Hardware', 'Software', 'IoT', 'AI/ML', 'Security'];

  // Category → interest mapping for filtering
  const categoryMap: Record<string, string[]> = {
    Hardware: ['Embedded Systems', 'FPGA', 'Digital Electronics', 'Robotics'],
    Software: ['Web Development', 'UI/UX Design', 'Mobile Development', 'Backend Engineering', 'Database Systems', 'DevOps', 'Game Development', 'Graphic Design', 'Photography', 'Cloud Computing'],
    IoT: ['IoT', 'Smart Home', 'Microcontrollers'],
    'AI/ML': ['Machine Learning', 'Computer Vision', 'AI', 'Data Science', 'AR/VR'],
    Security: ['Cybersecurity', 'Network Security', 'Reverse Engineering', 'CTF', 'Linux Administration'],
  };

  // Filter students
  const filtered = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        searchQuery === '' ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nim.includes(searchQuery) ||
        (student.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesCategory =
        activeCategory === 'All' ||
        student.interests.some((interest) =>
          (categoryMap[activeCategory] ?? []).includes(interest)
        );

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleCloseModal = useCallback(() => {
    setSelectedStudent(null);
  }, []);

  return (
    <section id="students" className="py-24 md:py-32 relative">
      <div className="container-custom">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase mb-4">
            Digital Yearbook
          </p>
          <h2 className="text-fluid-heading font-heading font-bold text-text-primary mb-4">
            The People Behind the{' '}
            <span className="text-accent">Builds</span>
          </h2>
          <p className="text-fluid-body text-text-muted max-w-2xl mb-10">
            {students.length} students. Each with their own stack, their own story, their own way of breaking things before making them work.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            placeholder="Search by name or NIM..."
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
                onClick={() => setSelectedStudent(student)}
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

      {/* Modal */}
      <StudentModal student={selectedStudent} onClose={handleCloseModal} />
    </section>
  );
}
