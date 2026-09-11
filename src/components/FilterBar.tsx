'use client';

import { Search } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  placeholder?: string;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  placeholder = 'Search...',
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-border-accent transition-colors duration-200 font-body"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3.5 py-1.5 text-xs font-mono tracking-wider rounded-lg border transition-all duration-200 cursor-pointer uppercase ${
              activeCategory === cat
                ? 'bg-accent/10 border-border-accent text-accent'
                : 'bg-transparent border-border text-text-muted hover:border-text-dim hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
