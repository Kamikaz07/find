'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchBarProps {
  types: string[];
  onSearch: (type: string, location: string) => void;
}

export function SearchBar({ types, onSearch }: SearchBarProps) {
  const searchParams = useSearchParams();
  const [type, setType] = useState(searchParams.get('type') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(type, location);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md"
        >
          <option value="">Todos os tipos</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Localização"
          className="flex-1 px-4 py-2 border rounded-md"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
        >
          Pesquisar
        </button>
      </div>
    </form>
  );
} 