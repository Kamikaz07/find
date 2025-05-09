'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Image from "next/image";

interface Announcement {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  price?: number;
}

const typeOptions = [
  { value: '', label: 'Todas as Categorias' },
  { value: 'roupas', label: 'Roupas' },
  { value: 'moveis', label: 'Móveis' },
  { value: 'eletrodomesticos', label: 'Eletrodomésticos' },
  { value: 'livros', label: 'Livros' },
  { value: 'brinquedos', label: 'Brinquedos' },
  { value: 'outros', label: 'Outros' },
];

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        let url = `/api/announcements?`;
        if (type) url += `type=${encodeURIComponent(type)}&`;
        if (location) url += `location=${encodeURIComponent(location)}&`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }
        const data = await response.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [type, location]);

  // Filter by search (title/description)
  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#E0F4F4] flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-center items-center gap-4 mb-12">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Buscar anúncios..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-10 h-12 bg-white rounded-lg w-full border focus:border-blue-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"></path>
              </svg>
            </div>
          </div>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="h-12 rounded-lg border bg-white px-4 text-gray-700"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Localização"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="h-12 rounded-lg border bg-white px-4 text-gray-700"
          />
          <Link href="/anunciar">
            <span className="bg-[#40B3B3] hover:bg-[#329999] text-white font-semibold py-2 px-4 rounded text-sm transition-colors whitespace-nowrap">
              Criar Anúncio
            </span>
          </Link>
        </div>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center text-gray-600">Nenhum anúncio encontrado</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-[#B2E4E4] rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="relative w-full h-48">
                  {announcement.image_url ? (
                    <Image
                      src={announcement.image_url}
                      alt={announcement.title}
                      fill
                      className="object-cover"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">Sem imagem</span>
                    </div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-bold text-teal-800">
                    {announcement.title}
                  </h3>
                  {announcement.price !== undefined && (
                    <p className="text-green-700 font-semibold mt-1">
                      € {announcement.price.toFixed(2)}
                    </p>
                  )}
                  <p className="text-gray-600">{announcement.location}</p>
                  <p className="text-gray-700 mt-3 line-clamp-2">
                    {announcement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AnnouncementsPage;
