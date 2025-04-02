import React from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Image from "next/image";

type Produto = {
  id: number;
  title: string;
  imageUrl: string;
  location: string;
  description: string;
  price: number;
};

const produtos: Produto[] = [
  {
    id: 1,
    title: "Mesa de jantar em madeira",
    imageUrl: "/produto1.jpg",
    location: "Lisboa, Portugal",
    description: "Mesa clássica em ótimo estado. Ideal para 6 pessoas.",
    price: 150.0,
  },
  {
    id: 2,
    title: "Bicicleta urbana",
    imageUrl: "/produto2.jpg",
    location: "Porto, Portugal",
    description: "Bicicleta leve e confortável para o dia a dia na cidade.",
    price: 220.5,
  },
  {
    id: 3,
    title: "Sofá 3 lugares cinza",
    imageUrl: "/produto3.jpg",
    location: "Coimbra, Portugal",
    description: "Sofá espaçoso e confortável, pouco usado.",
    price: 300,
  },
];

const MercadoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#E0F4F4] flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-center items-center gap-4 mb-12">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Buscar produtos..."
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

          <Link href="/vender">
            <span className="bg-[#40B3B3] hover:bg-[#329999] text-white font-semibold py-2 px-4 rounded text-sm transition-colors whitespace-nowrap">
              Vender Produto
            </span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {produtos.map((produto) => (
            <Link
              key={produto.id}
              href={`/produto/${produto.id}`}
              className="block"
            >
              <div className="bg-[#B2E4E4] rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <Image
                  src={produto.imageUrl}
                  alt={produto.title}
                  width={500}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 text-center">
                  <h3 className="text-xl font-bold text-teal-800">
                    {produto.title}
                  </h3>
                  <p className="text-green-700 font-semibold mt-1">
                    € {produto.price.toFixed(2)}
                  </p>
                  <p className="text-gray-600">{produto.location}</p>
                  <p className="text-gray-700 mt-3 line-clamp-2">
                    {produto.description}
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

export default MercadoPage;
