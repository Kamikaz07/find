"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

const ContaPage = () => {
    const [abaAtiva, setAbaAtiva] = useState("anuncios");
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
  
    // Dados simulados (só para placeholder)
    const user = {
      nome: "João Silva",
      email: "joao@email.com",
      telemovel: "912345678",
    };
  
    // Proteção da rota
    useEffect(() => {
      const checkAuth = async () => {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
  
        if (!session?.user) {
          router.push("/login");
        } else {
          setIsLoading(false);
        }
      };
  
      checkAuth();
    }, [router]);
  
    if (isLoading) return null; // ou um spinner se quiseres
  
    return (
      <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
        <Header />
  
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-teal-800 mb-6">A Minha Conta</h1>
  
          <div className="flex space-x-6 border-b border-teal-300 mb-6 text-teal-700 font-semibold text-lg">
            <button
              onClick={() => setAbaAtiva("anuncios")}
              className={`pb-2 transition ${
                abaAtiva === "anuncios"
                  ? "border-b-4 border-teal-600 text-teal-800"
                  : "hover:text-teal-900"
              }`}
            >
              Meus Anúncios
            </button>
            <button
              onClick={() => setAbaAtiva("contactos")}
              className={`pb-2 transition ${
                abaAtiva === "contactos"
                  ? "border-b-4 border-teal-600 text-teal-800"
                  : "hover:text-teal-900"
              }`}
            >
              Contactos
            </button>
            <button
              onClick={() => setAbaAtiva("perfil")}
              className={`pb-2 transition ${
                abaAtiva === "perfil"
                  ? "border-b-4 border-teal-600 text-teal-800"
                  : "hover:text-teal-900"
              }`}
            >
              Perfil
            </button>
          </div>
  
          {abaAtiva === "anuncios" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-teal-700 mb-4">Ainda não há nenhum anúncio publicado.</p>
              <Link
                href="/anunciar"
                className="inline-block bg-teal-600 text-white px-6 py-2 rounded-md shadow hover:bg-teal-700 transition"
              >
                Criar Anúncio
              </Link>
            </div>
          )}
  
          {abaAtiva === "contactos" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-teal-700">Nenhum contacto recente encontrado.</p>
            </div>
          )}
  
          {abaAtiva === "perfil" && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-teal-700">Nome</label>
                <div className="mt-1 px-4 py-2 bg-gray-100 rounded-md">{user.nome}</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-teal-700">Email</label>
                <div className="mt-1 px-4 py-2 bg-gray-100 rounded-md">{user.email}</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-teal-700">Telemóvel</label>
                <div className="mt-1 px-4 py-2 bg-gray-100 rounded-md">{user.telemovel}</div>
              </div>
              <button className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md shadow hover:bg-teal-700 transition">
                Editar Dados (placeholder)
              </button>
            </div>
          )}
        </main>
  
        <Footer />
      </div>
    );
  };
  
  export default ContaPage;