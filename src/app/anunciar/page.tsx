"use client";

import React from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';

const AnunciarPage = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [publisher, setPublisher] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // New states for goals and expiration date
  const [hasGoal, setHasGoal] = useState(false);
  const [goalType, setGoalType] = useState<'donation' | 'delivery'>('donation');
  const [targetAmount, setTargetAmount] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

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

    // Clear any previous errors
    setError(null);

    if (!title || !location || !publisher || !description) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      Swal.fire({
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha todos os campos obrigatórios.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#40B3B3'
      });
      return;
    }

    // Validate goal if it's enabled
    if (hasGoal && (!goalType || !targetAmount || parseFloat(targetAmount) <= 0)) {
      setError("Por favor, defina um objetivo válido com valor positivo.");
      Swal.fire({
        title: 'Objetivo inválido',
        text: 'Por favor, defina um objetivo válido com valor positivo.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#40B3B3'
      });
      return;
    }

    // Validate expiration date
    if (expirationDate) {
      const selectedDate = new Date(expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setError("A data de expiração não pode ser no passado.");
        Swal.fire({
          title: 'Data inválida',
          text: 'A data de expiração não pode ser no passado.',
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#40B3B3'
        });
        return;
      }
    }

    // Show loading indicator
    Swal.fire({
      title: 'Criando anúncio',
      text: 'Por favor, aguarde...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Upload image if one is selected
      let imageUrl = '/placeholder.jpg';

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
        imageUrl = uploadData.url;
      }

      // Create the advertisement
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
          image_url: imageUrl,
          expiration_date: expirationDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create advertisement');
      }

      const responseData = await response.json();
      const advertisementId = responseData.advertisement.id;

      // If goal is enabled, create a goal for the advertisement
      if (hasGoal && advertisementId) {
        const goalResponse = await fetch(`/api/advertisements/${advertisementId}/goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal_type: goalType,
            target_amount: parseFloat(targetAmount)
          }),
        });

        if (!goalResponse.ok) {
          const errorData = await goalResponse.json();
          throw new Error(errorData.error || 'Failed to create goal');
        }
      }

      // Success message with SweetAlert2
      Swal.fire({
        title: 'Sucesso!',
        text: 'Anúncio criado com sucesso!',
        icon: 'success',
        confirmButtonText: 'Ver anúncios',
        confirmButtonColor: '#40B3B3'
      }).then((result) => {
        router.push('/anuncios');
      });
      
    } catch (error) {
      console.error('Error creating advertisement:', error);
      setError(`Erro ao criar anúncio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Error message with SweetAlert2
      Swal.fire({
        title: 'Erro',
        text: `Erro ao criar anúncio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        icon: 'error',
        confirmButtonText: 'Tentar novamente',
        confirmButtonColor: '#40B3B3'
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleFileChange = (file: File) => {
    if (file.type.startsWith("image/")) {
      setImage(file);
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo de imagem válido.");
      Swal.fire({
        title: 'Formato inválido',
        text: 'Por favor, selecione um arquivo de imagem válido.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#40B3B3'
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  // Calculate minimum date for the expiration date input (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4] py-10 px-4">
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4">
            Criar Novo Anúncio
          </h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="title">
                Título do Anúncio
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="location">
                Localização
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="publisher">
                Publicado por
              </label>
              <input
                id="publisher"
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Nome da organização ou pessoa"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                rows={4}
                required
              ></textarea>
            </div>
            
            {/* Expiration Date field */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="expirationDate">
                Data de Expiração
              </label>
              <input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                min={minDate}
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional. Se não for definida, o anúncio não expirará automaticamente.
              </p>
            </div>
            
            {/* Goal settings */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center mb-4">
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    id="hasGoal" 
                    type="checkbox" 
                    checked={hasGoal} 
                    onChange={(e) => setHasGoal(e.target.checked)} 
                    className="absolute block w-6 h-6 bg-white border-4 border-gray-300 rounded-full appearance-none cursor-pointer peer checked:border-teal-500 checked:bg-teal-500 checked:right-0 transition-all duration-200"
                  />
                  <label 
                    htmlFor="hasGoal" 
                    className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer peer-checked:bg-teal-200"
                  ></label>
                </div>
                <label htmlFor="hasGoal" className="font-medium text-gray-700 cursor-pointer">
                  Definir um objetivo para este anúncio
                </label>
              </div>
              
              {hasGoal && (
                <div className="pl-6 space-y-3 bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="goalType">
                      Tipo de Objetivo
                    </label>
                    <div className="relative">
                      <select
                        id="goalType"
                        value={goalType}
                        onChange={(e) => setGoalType(e.target.value as 'donation' | 'delivery')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all pr-8"
                        required={hasGoal}
                      >
                        <option value="donation">Doação (valor monetário)</option>
                        <option value="delivery">Entrega</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="targetAmount">
                      {goalType === 'donation' ? 'Valor a Arrecadar (€)' : 'Quantidade'}
                    </label>
                    <div className="relative">
                      <input
                        id="targetAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder={goalType === 'donation' ? "0.00" : "0"}
                        required={hasGoal}
                      />
                      {goalType === 'donation' && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500">€</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="image">
                Imagem do Anúncio
              </label>
              <div 
                className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors duration-200 ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image')?.click()}
              >
                <input
                  id="image"
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-1 text-sm text-gray-600">
                  {image ? image.name : 'Clique ou arraste uma imagem para aqui'}
                </p>
                <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
              </div>
              
              {image && (
                <div className="mt-2 relative">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Preview do anúncio"
                    width={500}
                    height={300}
                    className="max-h-48 object-contain rounded-md mx-auto border border-gray-200"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
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
