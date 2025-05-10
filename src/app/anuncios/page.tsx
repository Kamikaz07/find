'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Image from "next/image";
type Anuncio = {
  id: string;
  title: string;
  image_url: string;
  location: string;
  description: string;
  publisher: string;
  created_at: string;
};

const AnunciosPage: React.FC = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch advertisements
  useEffect(() => {
    const fetchAnuncios = async () => {
      try {
        setIsLoading(true);
        const url = searchTerm 
          ? `/api/advertisements?search=${encodeURIComponent(searchTerm)}`
          : '/api/advertisements';

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch advertisements');
        }

        const data = await response.json();
        setAnuncios(data.advertisements || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching advertisements:', err);
        setError('Failed to load advertisements. Please try again later.');
        setAnuncios([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnuncios();
  }, [searchTerm]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already triggered by the useEffect dependency on searchTerm
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
              className="pl-10 pr-10 h-12 bg-white rounded-lg w-full border focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <span className="sr-only">Search</span>
            </button>
          </form>

          <Link href="/anunciar">
            <span className="bg-[#40B3B3] hover:bg-[#329999] text-white font-semibold py-2 px-4 rounded text-sm transition-colors whitespace-nowrap">
              Criar Anúncio
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : anuncios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nenhum anúncio encontrado.</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 text-teal-600 hover:text-teal-800"
              >
                Limpar pesquisa
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {anuncios.map((anuncio) => (
              <Link
                key={anuncio.id}
                href={`/anuncio/${anuncio.id}`}
                className="block"
              >
                <div className="bg-[#B2E4E4] rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <Image
                    src={anuncio.image_url || '/placeholder.jpg'}
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
