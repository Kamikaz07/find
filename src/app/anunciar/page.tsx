"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';

const AnunciarPage = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [publisher, setPublisher] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [expirationDate, setExpirationDate] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Advertisement goals state
  const [includeGoal, setIncludeGoal] = useState(false);
  const [goalType, setGoalType] = useState("donation");
  const [targetAmount, setTargetAmount] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !location || !publisher || !description) {
      Swal.fire('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    // Validate goal amount if goal is included
    if (includeGoal) {
      const amount = parseFloat(targetAmount);
      if (isNaN(amount) || amount <= 0) {
        Swal.fire('Meta Inválida', 'Por favor, insira um valor válido maior que zero para a meta.', 'warning');
        return;
      }
    }

    Swal.fire({
      title: 'Publicando Anúncio...',
      text: 'Por favor, aguarde.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let imageUrl = '';
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Falha ao carregar imagem.');
        }
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      } catch (err) {
        Swal.fire('Erro no Upload', err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao carregar a imagem.', 'error');
        return;
      }
    }

    try {
      // Create advertisement first
      const response = await fetch('/api/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          location,
          publisher,
          image_url: imageUrl || null,
          is_public: isPublic,
          expiration_date: expirationDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar anúncio.');
      }

      const { advertisement } = await response.json();
      
      // Add goal if included
      if (includeGoal && advertisement.id) {
        const goalResponse = await fetch(`/api/advertisements/${advertisement.id}/goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal_type: goalType,
            target_amount: parseFloat(targetAmount),
          }),
        });

        if (!goalResponse.ok) {
          const errorData = await goalResponse.json();
          Swal.fire(
            'Anúncio Criado com Aviso', 
            `O anúncio foi criado, mas houve um problema ao adicionar a meta: ${errorData.error || 'Erro desconhecido'}`,
            'warning'
          ).then(() => router.push("/anuncios"));
          return;
        }
      }

      Swal.fire('Sucesso!', 'Anúncio criado com sucesso!', 'success')
        .then(() => router.push("/anuncios"));

    } catch (err) {
      Swal.fire('Erro ao Criar Anúncio', err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.', 'error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        Swal.fire('Ficheiro Inválido', 'Por favor, selecione um ficheiro de imagem.', 'warning');
        setImage(null);
        setImagePreview(null);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4] py-10 px-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-teal-700">
            Criar Novo Anúncio
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                Título do Anúncio
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                Localização
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="publisher">
                Publicado por (Nome da organização ou pessoa)
              </label>
              <input
                id="publisher"
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out h-32 resize-none"
                rows={4}
                required
              ></textarea>
            </div>

            {/* Advertisement Goals Section */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  id="includeGoal"
                  type="checkbox"
                  checked={includeGoal}
                  onChange={(e) => setIncludeGoal(e.target.checked)}
                  className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 shadow-sm transition duration-150 ease-in-out"
                />
                <label htmlFor="includeGoal" className="text-sm font-medium text-gray-700">
                  Adicionar Meta ao Anúncio?
                </label>
              </div>

              {includeGoal && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Meta
                    </label>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          id="donation"
                          type="radio"
                          name="goalType"
                          value="donation"
                          checked={goalType === "donation"}
                          onChange={() => setGoalType("donation")}
                          className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                        />
                        <label htmlFor="donation" className="ml-2 text-sm text-gray-700">
                          Doação (€)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="delivery"
                          type="radio"
                          name="goalType"
                          value="delivery"
                          checked={goalType === "delivery"}
                          onChange={() => setGoalType("delivery")}
                          className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                        />
                        <label htmlFor="delivery" className="ml-2 text-sm text-gray-700">
                          Entrega (Unidades)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="targetAmount">
                      {goalType === "donation" ? "Valor Objetivo (€)" : "Quantidade Objetivo"}
                    </label>
                    <div className="relative">
                      <input
                        id="targetAmount"
                        type="number"
                        step={goalType === "donation" ? "0.01" : "1"}
                        min="0.01"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                        required={includeGoal}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500">{goalType === "donation" ? "€" : "unid."}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {goalType === "donation" 
                        ? "Defina um valor objetivo para angariar fundos para esta causa." 
                        : "Defina uma quantidade objetivo para receber doações físicas."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image">
                Imagem do Anúncio (Opcional)
              </label>
              <input
                id="image"
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition duration-150 ease-in-out"
              />
              {imagePreview && (
                <div className="mt-4 relative w-48 h-36 mx-auto border border-gray-200 rounded-md overflow-hidden shadow-sm">
                  <Image
                    src={imagePreview}
                    alt="Preview do anúncio"
                    layout="fill"
                    objectFit="cover"
                  />
                   <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none hover:bg-red-600 transition-colors"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    aria-label="Remover imagem"
                  >
                    X
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 shadow-sm transition duration-150 ease-in-out"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Tornar Anúncio Público?
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expirationDate">
                Data de Expiração (Opcional)
              </label>
              <input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50"
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
