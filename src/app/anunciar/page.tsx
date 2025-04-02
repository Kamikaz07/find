"use client";

import React from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";


const AnunciarPage = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [publisher, setPublisher] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (!session?.user) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você poderia implementar o upload da imagem e salvar os dados em um backend
    alert("Anúncio criado com sucesso!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      setImage(file);
    } else {
      alert("Por favor, selecione um arquivo de imagem válido.");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4] py-10 px-4">
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4">
            Criar Novo Anúncio
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700" htmlFor="title">
                Título do Anúncio
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="location">
                Localização
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="publisher">
                Publicado por
              </label>
              <input
                id="publisher"
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Nome da organização ou pessoa"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="image">
                Imagem do Anúncio
              </label>
              <input
                id="image"
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="w-full px-3 py-2 border rounded-md"
              />
              {image && (
                <Image
                  src={URL.createObjectURL(image)}
                  alt="Preview do anúncio"
                  width={500} // Defina a largura desejada
                  height={300} // Defina a altura desejada
                />
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition"
            >
              Publicar Anúncio
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AnunciarPage;
