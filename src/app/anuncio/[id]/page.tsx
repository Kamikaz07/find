'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from '@/utils/supabase/client';
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import Image from "next/image";

interface Announcement {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  image_url: string | null;
  created_at: string;
  user: {
    email: string;
  };
}

export default function AnnouncementPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClient();
  const [showContact, setShowContact] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*, user:profiles(email)')
          .eq('id', id)
          .single();
        if (error) throw new Error(error.message);
        setAnnouncement(data);
      } catch (err: any) {
        setError('Falha ao carregar anúncio');
        console.error('Error fetching announcement:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{ error || 'Anúncio não encontrado' }</p>
      </div>
    );
  }

  const handlePromote = () => {
    router.push(
      `/pagamento?title=${encodeURIComponent(announcement.title)}&imageUrl=${encodeURIComponent(announcement.image_url || '')}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
      <Header />

      <main className="flex-grow container mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-8 p-4 bg-white rounded-lg shadow-lg">
          <div>
            {announcement.image_url ? (
              <Image
                src={announcement.image_url}
                alt={announcement.title}
                className="w-full h-auto rounded-lg shadow-md"
                width={500}
                height={300}
              />
            ) : (
              <div className="w-full h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">{announcement.title}</h2>
              <p className="text-2xl font-semibold text-teal-700 mt-2">
                {announcement.location}
              </p>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 10.45a8.38 8.38 0 0 1-1.69 5.72L12 21 4.69 16.17A8.5 8.5 0 1 1 21 10.45z"></path>
              </svg>
              <span>{announcement.location}</span>
            </div>

            <div className="bg-[#E0F4F4] rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-4">
                <svg
                  className="h-12 w-12 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <div>
                  <h3 className="font-semibold">Publicado por {announcement.user.email}</h3>
                  <p className="text-sm text-gray-500">Usuário</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowContact(!showContact)}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
              >
                Contactar Anunciante
              </button>
              <button
                onClick={handlePromote}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
              >
                Promover
              </button>
            </div>

            {showContact && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-md">
                <h3 className="text-lg font-semibold">Contato:</h3>
                <p className="text-gray-700">{announcement.user.email}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{announcement.description}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
