"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Image from "next/image";

type Anuncio = {
  id: number;
  title: string;
  imageUrl: string;
  location: string;
  description: string;
};

const anuncios: Anuncio[] = [
  {
    id: 1,
    title: "Bens necessários para os Bombeiros",
    imageUrl: "/3.jpg",
    location: "Sintra, Portugal",
    description:
      "Precisamos de bens para atender as emergências da comunidade.",
  },
  {
    id: 2,
    title: "Cadeira de Rodas Urgente",
    imageUrl: "/2.jpg",
    location: "Porto, Portugal",
    description:
      "Uma cadeira de rodas é necessária para um idoso da comunidade.",
  },
  {
    id: 3,
    title: "Tampinhas Plásticas para Doação",
    imageUrl: "/1.jpg",
    location: "Lisboa, Portugal",
    description: "Precisamos de tampinhas plásticas para campanha de doação.",
  },
];

const AnunciosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality here
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {anuncios.map((anuncio) => (
            <Link
              key={anuncio.id}
              href={`/anuncio/${anuncio.id}`}
              className="block"
            >
              <div className="bg-[#B2E4E4] rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <Image
                  src={anuncio.imageUrl}
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
      </main>
      <Footer />
    </div>
  );
};

export default AnunciosPage;
