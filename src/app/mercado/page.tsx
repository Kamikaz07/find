'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

interface MercadoItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  created_at: string;
}

export default function MercadoPage() {
  const supabase = createClient();
  const [items, setItems] = useState<MercadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        setItems(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Header />
      <main className="p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Mercado</h1>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-600">Nenhum item encontrado</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map(item => (
              <Link
                key={item.id}
                href={`/mercado/${item.id}`}
                className="block bg-white rounded-lg shadow-lg hover:shadow-xl overflow-hidden"
              >
                <div className="relative w-full h-48">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">Sem imagem</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                  <p className="text-gray-600 mb-2">Preço: €{item.price.toFixed(2)}</p>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
