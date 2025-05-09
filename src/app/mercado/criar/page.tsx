'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

export default function CreateMercadoItemPage() {
  const supabase = createClient();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error: err } = await supabase
        .from('marketplace')
        .insert([{ title, description, price: parseFloat(price), image_url: imageUrl || null }]);
      if (err) throw new Error(err.message);
      router.push('/mercado');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Header />
      <main className="p-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Vender Produto</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="p-2 border rounded"
            placeholder="Título"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            className="p-2 border rounded"
            placeholder="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <input
            className="p-2 border rounded"
            type="number"
            step="0.01"
            placeholder="Preço"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />
          <input
            className="p-2 border rounded"
            placeholder="URL da Imagem"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          <button className="bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition">
            Criar
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
