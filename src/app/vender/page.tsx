/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';

const VenderPage = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [publisher, setPublisher] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [category, setCategory] = useState("Geral");
  const [isPublic, setIsPublic] = useState(true);

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

    if (!title || !price || !location || !publisher || !description) {
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

    // Validate price is a number
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError("Por favor, insira um preço válido maior que zero.");
      Swal.fire({
        title: 'Preço inválido',
        text: 'Por favor, insira um preço válido maior que zero.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#40B3B3'
      });
      return;
    }

    // Show loading indicator
    Swal.fire({
      title: 'Publicando produto',
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

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          price: priceValue,
          location,
          publisher,
          image_url: imageUrl,
          category,
          is_public: isPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      // Success message with SweetAlert2
      Swal.fire({
        title: 'Sucesso!',
        text: 'Produto publicado com sucesso!',
        icon: 'success',
        confirmButtonText: 'Ver no mercado',
        confirmButtonColor: '#40B3B3'
      }).then((result) => {
        router.push('/mercado');
      });
    } catch (error) {
      console.error('Error creating product:', error);
      setError(`Erro ao criar produto: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Error message with SweetAlert2
      Swal.fire({
        title: 'Erro',
        text: `Erro ao criar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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

  // Predefined categories
  const categories = [
    "Geral",
    "Eletrônicos",
    "Móveis",
    "Vestuário",
    "Livros",
    "Esportes",
    "Cozinha",
    "Decoração",
    "Jardim",
    "Outros"
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4] py-10 px-4">
        {/* Standardized container styling */}
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-teal-700">
            Vender Produto
          </h1>
          {/* error state is handled by Swal, but can be kept for non-Swal errors if any */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
              <p className="font-bold">Erro</p>
              <p>{error}</p>
            </div>
          )}
          {/* Standardized form styling */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="title">
                Nome do Produto
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="price">
                  Preço (€)
                </label>
                <div className="relative">
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">€</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="category">
                  Categoria
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all pr-8"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
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
                Vendedor
              </label>
              <input
                id="publisher"
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Seu nome ou nome da loja"
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
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="image">
                Imagem do Produto
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
                    alt="Preview do produto"
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
            
            <div className="flex items-center space-x-4">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 transition duration-150 ease-in-out"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Tornar Produto Público?
              </label>
            </div>

            <div>
            <button
              type="submit"
              className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-70"
            >
              Publicar Produto
            </button>
            </div> {/*This div was missing a closing tag, added it here. Or it might be an extra opening tag if the button is meant to be outside a div.*/}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VenderPage;