"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import Image from "next/image";

type Anuncio = {
  id: number;
  title: string;
  imageUrl: string;
  location: string;
  description: string;
  contact: string;
};

const anuncios: Anuncio[] = [
  {
    id: 1,
    title: "Bens necessários para os Bombeiros",
    imageUrl: "/3.jpg",
    location: "Sintra, Portugal",
    description:
      "Precisamos de bens para atender as emergências da comunidade.",
    contact: "904 248 357",
  },
  {
    id: 2,
    title: "Cadeira de Rodas Urgente",
    imageUrl: "/2.jpg",
    location: "Porto, Portugal",
    description:
      "Uma cadeira de rodas é necessária para um idoso da comunidade.",
    contact: "904 248 357",
  },
  {
    id: 3,
    title: "Tampinhas Plásticas para Doação",
    imageUrl: "/1.jpg",
    location: "Lisboa, Portugal",
    description: "Precisamos de tampinhas plásticas para campanha de doação.",
    contact: "904 248 357",
  },
];

export default function ProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [showContact, setShowContact] = useState(false);

  const anuncio = anuncios.find((anuncio) => anuncio.id === Number(id));

  if (!anuncio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Anúncio não encontrado</p>
      </div>
    );
  }

  const handlePromote = () => {
    router.push(
      `/pagamento?title=${encodeURIComponent(anuncio.title)}&imageUrl=${encodeURIComponent(anuncio.imageUrl)}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
      <Header />

      <main className="flex-grow container mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-8 p-4 bg-white rounded-lg shadow-lg">
          <div>
            <Image
              src={anuncio.imageUrl}
              alt={anuncio.title}
              className="w-full h-auto rounded-lg shadow-md"
              width={500}
              height={300}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">{anuncio.title}</h2>
              <p className="text-2xl font-semibold text-teal-700 mt-2">
                {anuncio.location}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 10.45a8.38 8.38 0 0 1-1.69 5.72L12 21 4.69 16.17A8.5 8.5 0 1 1 21 10.45z"></path>
              </svg>
              <span>{anuncio.location}</span>
            </div>
            <Card>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <svg
                    className="h-12 w-12 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <div>
                    <h3 className="font-semibold">Publicado por FIND</h3>
                    <p className="text-sm text-gray-500">Organização</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões lado a lado */}
            <div className="flex space-x-4">
              <Button onClick={() => setShowContact(!showContact)}>
                Contactar Anunciante
              </Button>
              <Button onClick={handlePromote}>
                Promover
              </Button>
            </div>

            {/* Exibir contato se o botão for clicado */}
            {showContact && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-md">
                <h3 className="text-lg font-semibold">Contato:</h3>
                <p className="text-gray-700">{anuncio.contact}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{anuncio.description}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Button({
  children,
  onClick,
}: Readonly<{ children: React.ReactNode; onClick: () => void }>) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
    >
      {children}
    </button>
  );
}

function Card({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-[#E0F4F4] rounded-lg shadow-md p-4">{children}</div>
  );
}

function CardContent({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="p-4">{children}</div>;
}
