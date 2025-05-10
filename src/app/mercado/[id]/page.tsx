'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

interface MercadoItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  created_at: string;
}

export default function MercadoItemPage() {
  const { id } = useParams();
  const supabase = createClient();
  const [item, setItem] = useState<MercadoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw new Error(error.message);
        setItem(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;
  if (!item) return <div className="text-center text-gray-600">Item não encontrado</div>;

  return (
    <>
      <Header />
      <main className="p-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
        <div className="relative w-full h-64 mb-4">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">Sem imagem</span>
            </div>
          )}
        </div>
        <p className="text-xl font-semibold mb-2">Preço: €{item.price.toFixed(2)}</p>
        <p className="mb-4">{item.description}</p>
        <p className="text-sm text-gray-500">
          Publicado em: {new Date(item.created_at).toLocaleDateString()}
        </p>
      </main>
      <Footer />
    </>
  );
}
