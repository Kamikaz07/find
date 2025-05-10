'use client';

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import Image from "next/image";

type Anuncio = {
  id: string;
  title: string;
  description: string;
  location: string;
  publisher: string;     // From advertisements.publisher
  image_url?: string;   // From advertisements table
  imageUrl?: string;    // Mapped from image_url for client use
  is_public?: boolean;  // From advertisements table
  contact?: string;     // User's phone number, added by API
  contact_email?: string; // User's email, added by API
  // Removed user object as contact info is flattened
};

interface Goal {
  id: string;
  goal_type: 'donation' | 'delivery';
  current_amount: number;
  target_amount: number;
}

export default function AnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // id is a string from params

  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [goalsError, setGoalsError] = useState<string | null>(null); // Keep for future use

  const [showContact, setShowContact] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");

  useEffect(() => {
    if (id) {
      const fetchAnnouncement = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/advertisements/${id}`); // Changed URL
          if (!response.ok) {
            throw new Error(`Failed to fetch announcement: ${response.statusText}`);
          }
          const responseData = await response.json(); // API returns { advertisement: { ... } }
          const fetchedAnuncio: Anuncio = responseData.advertisement; // Extract the advertisement object

          // Map image_url to imageUrl if image_url exists and imageUrl doesn't
          if (fetchedAnuncio?.image_url && !fetchedAnuncio.imageUrl) { // Changed to optional chain
            fetchedAnuncio.imageUrl = fetchedAnuncio.image_url;
          }
          setAnuncio(fetchedAnuncio);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred");
          setAnuncio(null);
        } finally {
          setLoading(false);
        }
      };
      fetchAnnouncement();
    }
  }, [id]);

  useEffect(() => {
    if (anuncio?.id) {
      const fetchGoals = async () => {
        try {
          setGoalsLoading(true);
          // Assuming "anuncios" are "advertisements" for goals API
          const response = await fetch(`/api/advertisements/${anuncio.id}/goals`);
          if (!response.ok) {
            throw new Error(`Failed to fetch goals: ${response.statusText}`);
          }
          const data = await response.json();
          setGoals(data.goals ?? []); // API returns { goals: [] }
          setGoalsError(null);
        } catch (err) {
          setGoalsError(err instanceof Error ? err.message : "An unknown error occurred fetching goals");
          setGoals([]);
        } finally {
          setGoalsLoading(false);
        }
      };
      fetchGoals();
    }
  }, [anuncio?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4]">
        <p>Carregando anúncio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4]">
        <p>Erro ao carregar o anúncio: {error}</p>
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4]">
        <p>Anúncio não encontrado</p>
      </div>
    );
  }

  const handlePromote = () => {
    if (anuncio) {
      router.push(
        `/pagamento?title=${encodeURIComponent(anuncio.title)}&imageUrl=${encodeURIComponent(anuncio.imageUrl ?? '')}`
      );
    }
  }

  const handleDonation = async (goalId: string) => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert("Por favor, insira um valor de doação válido.");
      return;
    }
    try {
      // Assuming PATCH request to update goal current_amount
      const response = await fetch(`/api/advertisements/${anuncio.id}/goals`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal_id: goalId,
          amount: parseFloat(donationAmount),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? `Failed to process donation: ${response.statusText}`);
      }
      const updatedGoal = await response.json();
      
      // Update the specific goal in the local state
      setGoals(prevGoals => prevGoals.map(g => g.id === goalId ? { ...g, current_amount: updatedGoal.goal.current_amount } : g));
      setDonationAmount(""); // Reset donation amount
      alert("Doação processada com sucesso!");

    } catch (err) {
      console.error("Error processing donation:", err);
      alert(err instanceof Error ? err.message : "Ocorreu um erro ao processar a doação.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
      <Header />

      <main className="flex-grow container mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-8 p-4 bg-white rounded-lg shadow-lg">
          {/* Left column with image */}
          <div>
            <Image
              src={anuncio.imageUrl ?? '/default-image.jpg'} // Provide a fallback image
              alt={anuncio.title}
              className="w-full h-auto rounded-lg shadow-md"
              width={500}
              height={300}
            />
          </div>

          {/* Right column with details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">{anuncio.title}</h2>
              <p className="text-2xl font-semibold text-teal-700 mt-2">
                {anuncio.location}
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
              <span>{anuncio.location}</span>
            </div>
            <Card>
              <CardContent>
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
                    <h3 className="font-semibold">Publicado por {anuncio.publisher}</h3>
                    <p className="text-sm text-gray-500">Organização</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões lado a lado */}
            <div className="flex space-x-4">
              <Button onClick={() => setShowContact(!showContact)}>
                Contactar Anunciante
              </Button>
              <Button onClick={handlePromote}>
                Promover
              </Button>
            </div>

            {/* Exibir contato se o botão for clicado */}
            {showContact && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-md">
                <h3 className="text-lg font-semibold">Contato:</h3>
                <p className="text-gray-700">{anuncio.contact ?? anuncio.contact_email ?? 'Não disponível'}</p>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{anuncio.description}</p>
            </div>

            {/* Goals section */}
            {goalsLoading && <p>Carregando objetivos...</p>}
            {goalsError && <p>Erro ao carregar objetivos: {goalsError}</p>}
            {!goalsLoading && !goalsError && goals.length === 0 && <p>Este anúncio ainda não tem objetivos definidos.</p>}
            {!goalsLoading && !goalsError && goals.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Objetivos</h3>

                {goals.map((goal) => (
                  <div key={goal.id} className="mb-6 bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">
                        {goal.goal_type === 'donation' ? 'Doação' : 'Entregas'}
                      </h4>
                      <span className="text-teal-600 font-semibold">
                        {new Intl.NumberFormat('pt-PT', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(goal.current_amount)} / {new Intl.NumberFormat('pt-PT', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(goal.target_amount)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                      <div 
                        className="bg-teal-500 h-4 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (goal.current_amount / goal.target_amount) * 100)}%` 
                        }}
                      ></div>
                    </div>

                    {goal.goal_type === 'donation' && (
                      <div className="flex items-center mt-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Valor da doação"
                          className="flex-grow px-3 py-2 border rounded-l-md"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                        />
                        <button
                          onClick={() => handleDonation(goal.id)}
                          className="bg-teal-500 text-white px-4 py-2 rounded-r-md hover:bg-teal-600 transition"
                        >
                          Doar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Button({
  children,
  onClick,
}: Readonly<{ children: React.ReactNode; onClick: () => void }>) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
    >
      {children}
    </button>
  );
}

function Card({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-[#E0F4F4] rounded-lg shadow-md p-4">{children}</div>
  );
}

function CardContent({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="p-4">{children}</div>;
}
