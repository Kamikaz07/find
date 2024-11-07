"use client";

import React, { useState } from "react";
import { Header } from "../Header/page";
import { Footer } from "../Footer/page";

const AnunciarPage = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [publisher, setPublisher] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você poderia implementar o upload da imagem e salvar os dados em um backend
    alert("Anúncio criado com sucesso!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImage(file);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4] py-10 px-4">
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4">Criar Novo Anúncio</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Título do Anúncio</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Localização</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Publicado por</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Nome da organização ou pessoa"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700">Imagem do Anúncio</label>
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="w-full px-3 py-2 border rounded-md"
              />
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
