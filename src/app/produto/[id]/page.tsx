"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import Image from "next/image";

type Produto = {
  id: number;
  title: string;
  imageUrl: string;
  location: string;
  description: string;
  contact: string;
  price: number;
};

const produtos: Produto[] = [
  {
    id: 1,
    title: "Mesa de jantar em madeira",
    imageUrl: "/produto1.jpg",
    location: "Lisboa, Portugal",
    description: "Mesa clássica em ótimo estado. Ideal para 6 pessoas.",
    contact: "912 345 678",
    price: 150.0,
  },
  {
    id: 2,
    title: "Bicicleta urbana",
    imageUrl: "/produto2.jpg",
    location: "Porto, Portugal",
    description: "Bicicleta leve e confortável para o dia a dia na cidade.",
    contact: "913 246 579",
    price: 220.5,
  },
  {
    id: 3,
    title: "Sofá 3 lugares cinza",
    imageUrl: "/produto3.jpg",
    location: "Coimbra, Portugal",
    description: "Sofá espaçoso e confortável, pouco usado.",
    contact: "917 333 111",
    price: 300,
  },
];

export default function ProdutoPage() {
  const router = useRouter();
  const { id } = useParams();
  const [showContact, setShowContact] = useState(false);

  const produto = produtos.find((p) => p.id === Number(id));

  if (!produto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Produto não encontrado</p>
      </div>
    );
  }

  const handlePromote = () => {
    router.push(
      `/pagamento?title=${encodeURIComponent(produto.title)}&imageUrl=${encodeURIComponent(
        produto.imageUrl
      )}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
      <Header />

      <main className="flex-grow container mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-8 p-4 bg-white rounded-lg shadow-lg">
          <div>
            <Image
              src={produto.imageUrl}
              alt={produto.title}
              className="w-full h-auto rounded-lg shadow-md"
              width={500}
              height={300}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">{produto.title}</h2>
              <p className="text-xl font-semibold text-green-700 mt-1">
                € {produto.price.toFixed(2)}
              </p>
              <p className="text-md font-medium text-teal-700">
                {produto.location}
              </p>
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
                    <p className="text-sm text-gray-500">Vendedor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button onClick={() => setShowContact(!showContact)}>
                Contactar Vendedor
              </Button>
              <Button onClick={handlePromote}>Promover</Button>
            </div>

            {showContact && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-md">
                <h3 className="text-lg font-semibold">Contato:</h3>
                <p className="text-gray-700">{produto.contact}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{produto.description}</p>
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
  return <div className="bg-[#E0F4F4] rounded-lg shadow-md p-4">{children}</div>;
}

function CardContent({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="p-4">{children}</div>;
}