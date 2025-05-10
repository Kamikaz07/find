"use client";

import React, { useState, useEffect, useCallback } from "react"; // Added useEffect, useCallback
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Image from "next/image";

// Updated Anuncio type to match advertisement structure from API
type Anuncio = {
  id: string; // Changed from number to string
  title: string;
  image_url?: string; // Changed from imageUrl, made optional
  location: string;
  description: string;
  publisher?: string; // Added publisher
  // Add other fields if necessary, e.g., created_at, is_public
};

// Removed hardcoded anuncios array

const AnunciosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [advertisements, setAdvertisements] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvertisements = useCallback(async (currentSearchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/advertisements?search=${encodeURIComponent(currentSearchTerm)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch advertisements: ${response.statusText}`);
      }
      const data = await response.json();
      setAdvertisements(data.advertisements ?? []); // API returns { advertisements: [] }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvertisements(searchTerm); // Initial fetch and fetch on searchTerm change if desired immediately
  }, [fetchAdvertisements, searchTerm]); // Or just [fetchAdvertisements] for initial load only and rely on handleSearch

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdvertisements(searchTerm); // Fetch with the current search term on form submit
  };

  return (
    <div className="min-h-screen bg-[#E0F4F4] flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-center items-center gap-4 mb-12">
          <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Buscar anúncios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          </form>

          <Link href="/anunciar">
            <span className="bg-[#40B3B3] hover:bg-[#329999] text-white font-semibold py-2 px-4 rounded text-sm transition-colors whitespace-nowrap">
              Criar Anúncio
            </span>
          </Link>
        </div>

        {loading && <p className="text-center">Carregando anúncios...</p>}
        {error && <p className="text-center text-red-500">Erro ao carregar anúncios: {error}</p>}
        {!loading && !error && advertisements.length === 0 && (
          <p className="text-center">Nenhum anúncio encontrado.</p>
        )}
        {!loading && !error && advertisements.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advertisements.map((anuncio) => (
              <Link
                key={anuncio.id}
                href={`/anuncio/${anuncio.id}`} // Link remains /anuncio/[id] as per previous updates
                className="block"
              >
                <div className="bg-[#B2E4E4] rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <Image
                    src={anuncio.image_url ?? "/logo.jpg"} // Use image_url, provide a fallback
                    alt={anuncio.title}
                    width={500}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-center text-teal-800">
                      {anuncio.title}
                    </h3>
                    <p className="text-center text-gray-600">
                      {anuncio.location}
                    </p>
                    <p className="text-gray-700 mt-3 line-clamp-2 text-center">
                      {anuncio.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AnunciosPage;
