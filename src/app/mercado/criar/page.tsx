'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import Image from 'next/image';
import Swal from 'sweetalert2';

export default function CreateMercadoItemPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Geral',
    location: '',
    publisher: '',
    is_public: true
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Predefined categories to match other product forms
  const categories = [
    "Geral", "Eletrônicos", "Móveis", "Vestuário", "Livros", 
    "Esportes", "Cozinha", "Decoração", "Jardim", "Outros"
  ];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    } else if (file) {
      setError("Por favor, selecione um arquivo de imagem válido.");
      Swal.fire('Formato inválido', 'Por favor, selecione um arquivo de imagem válido.', 'error');
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] || null);
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
    handleFileChange(e.dataTransfer.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.title || !formData.description || !formData.price || !formData.location || !formData.publisher) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      Swal.fire('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    // Price validation
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError("Por favor, insira um preço válido maior que zero.");
      Swal.fire('Preço inválido', 'Por favor, insira um preço válido maior que zero.', 'warning');
      return;
    }

    // Show loading indicator
    Swal.fire({
      title: 'Criando item',
      text: 'Por favor, aguarde...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Upload image if provided
      let imageUrl = null;
      
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

      // Insert into marketplace table
      const { error: dbError } = await supabase
        .from('marketplace')
        .insert([{ 
          title: formData.title, 
          description: formData.description, 
          price: priceValue, 
          image_url: imageUrl,
          category: formData.category,
          location: formData.location,
          publisher: formData.publisher,
          is_public: formData.is_public
        }]);

      if (dbError) throw new Error(dbError.message);
      
      Swal.fire('Sucesso!', 'Item criado com sucesso!', 'success')
        .then(() => router.push('/mercado'));
        
    } catch (err) {
      console.error('Error creating marketplace item:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      Swal.fire('Erro', `Erro ao criar item: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4] py-10 px-4">
        {/* Standardized container styling */}
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-teal-700">
            Adicionar Item ao Mercado
          </h1>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
              <p className="font-bold">Erro</p>
              <p>{error}</p>
            </div>
          )}
          {/* Standardized form styling */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                Título do Item
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
                  Preço (€)
                </label>
                <div className="relative">
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">€</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                  Categoria
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm appearance-none bg-white focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out pr-10"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                Localização
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="publisher">
                Vendedor
              </label>
              <input
                id="publisher"
                name="publisher"
                type="text"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                placeholder="Seu nome ou nome da loja"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out h-32 resize-none"
                rows={4}
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem do Item
              </label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 border-dashed'} rounded-lg hover:border-teal-400 transition duration-150 ease-in-out`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('imageUpload')?.click()}
              >
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="imageUpload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
                      <span>Carregar um ficheiro</span>
                      <input id="imageUpload" name="imageUpload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                </div>
              </div>
              
              {imagePreview && (
                <div className="mt-4 relative w-48 h-48 mx-auto border border-gray-200 rounded-md overflow-hidden shadow-sm">
                  <Image
                    src={imagePreview}
                    alt="Preview do item"
                    layout="fill"
                    objectFit="cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none hover:bg-red-600 transition-colors"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    aria-label="Remover imagem"
                  >
                    X
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input
                id="is_public"
                name="is_public"
                type="checkbox"
                checked={formData.is_public}
                onChange={handleChange}
                className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 shadow-sm transition duration-150 ease-in-out"
              />
              <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                Tornar Item Público?
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Criar Item
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
