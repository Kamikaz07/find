'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "../../../../components/Header";
import { Footer } from "../../../../components/Footer";
import Image from "next/image";

const EditarAnuncioPage = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [publisher, setPublisher] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Check authentication and fetch advertisement data
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        // Check authentication
        const authRes = await fetch("/api/auth/session");
        const session = await authRes.json();

        if (!session?.user) {
          router.push("/login");
          return;
        }

        // Fetch advertisement data
        const adRes = await fetch(`/api/advertisements/${id}`);

        if (!adRes.ok) {
          if (adRes.status === 404) {
            setError("Anúncio não encontrado");
          } else {
            throw new Error("Failed to fetch advertisement");
          }
          setIsLoading(false);
          return;
        }

        const { advertisement } = await adRes.json();

        // Set form data
        setTitle(advertisement.title);
        setLocation(advertisement.location);
        setPublisher(advertisement.publisher);
        setDescription(advertisement.description);
        setImageUrl(advertisement.image_url);

        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("Ocorreu um erro ao carregar os dados do anúncio");
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    setError(null);

    if (!title || !location || !publisher || !description) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // Use existing image URL or upload a new one
      let finalImageUrl = imageUrl || '/placeholder.jpg';

      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        finalImageUrl = uploadData.url;
      }

      const response = await fetch(`/api/advertisements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          location,
          publisher,
          image_url: finalImageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update advertisement');
      }

      // Success message could be shown on the page too, but for now we'll keep the alert
      alert("Anúncio atualizado com sucesso!");
      router.push('/conta');
    } catch (error) {
      console.error('Error updating advertisement:', error);
      setError(`Erro ao atualizar anúncio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      // Clear any previous errors when a valid image is selected
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo de imagem válido.");
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4]">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Erro</h2>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={() => router.push('/conta')}
              className="mt-6 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
            >
              Voltar para Minha Conta
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4] py-10 px-4">
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4">
            Editar Anúncio
          </h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
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
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Preview do anúncio"
                  width={500}
                  height={300}
                  className="mt-2 max-h-48 object-contain"
                />
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition"
              >
                Salvar Alterações
              </button>
              <button
                type="button"
                onClick={() => router.push('/conta')}
                className="flex-1 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditarAnuncioPage;
