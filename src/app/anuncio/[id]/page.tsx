"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Swal from 'sweetalert2';

type Anuncio = {
  id: string;
  title: string;
  image_url: string;
  location: string;
  description: string;
  publisher: string;
  created_at: string;
  contact?: string;
  contact_email?: string;
  user_id?: string;
};

type Goal = {
  id: string;
  advertisement_id: string;
  goal_type: 'donation' | 'delivery';
  target_amount: number;
  current_amount: number;
  created_at: string;
};

type ChatMessage = {
  id: string;
  message: string;
  sender: string;
  timestamp: Date;
};

export default function ProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();
  const [showContact, setShowContact] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch advertisement
        const adResponse = await fetch(`/api/advertisements/${id}`);
        if (!adResponse.ok) {
          throw new Error('Failed to fetch advertisement');
        }
        const adData = await adResponse.json();
        setAnuncio(adData.advertisement);

        // Fetch goals
        const goalsResponse = await fetch(`/api/advertisements/${id}/goals`);
        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          setGoals(goalsData.goals || []);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load advertisement. Please try again later.');
        setAnuncio(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // For now we'll use simulated chat messages
  const simulateChatMessages = () => {
    // Just set empty messages, they'll be filled when real ones are sent
    setChatMessages([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session) {
      return;
    }
    
    if (!anuncio?.user_id) {
      console.error('Error: Cannot send message - missing recipient user ID');
      Swal.fire({
        title: 'Erro',
        text: 'Não foi possível enviar a mensagem ao anunciante. ID de usuário do destinatário não encontrado.',
        icon: 'error',
        confirmButtonColor: '#40B3B3'
      });
      return;
    }
    
    try {
      setSendingMessage(true);
      
      console.log('Sending message to user ID:', anuncio.user_id);
      
      // Send the message via the API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: anuncio.user_id,
          message: newMessage.trim(),
          advertisementId: anuncio.id
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to send message:', response.status, data);
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }

      // Add the new message to the chat
      setChatMessages(prevMessages => [
        ...prevMessages,
        {
          id: data.message.id,
          message: data.message.message,
          sender: 'you',
          timestamp: new Date(data.message.created_at)
        }
      ]);
      
      // Clear the message input
      setNewMessage('');
      
      console.log('Message sent successfully:', data);
    } catch (error) {
      console.error('Error sending message:', error);
      Swal.fire({
        title: 'Erro',
        text: error instanceof Error ? error.message : 'Erro ao enviar mensagem. Tente novamente.',
        icon: 'error',
        confirmButtonColor: '#40B3B3'
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const toggleContact = () => {
    setShowContact(!showContact);
    setShowChat(false);
  };

  const toggleChat = () => {
    if (!session) {
      Swal.fire({
        title: 'Autenticação Necessária',
        text: 'Precisa fazer login para contactar o anunciante.',
        icon: 'info',
        confirmButtonColor: '#40B3B3',
        showCancelButton: true,
        confirmButtonText: 'Fazer Login',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login');
        }
      });
      return;
    }
    
    if (!showChat) {
      simulateChatMessages();
    }
    setShowChat(!showChat);
    setShowContact(false);
  };

  // ...existing loading and error states...

  const handlePromote = () => {
    router.push(
      `/pagamento?title=${encodeURIComponent(anuncio!.title)}&imageUrl=${encodeURIComponent(anuncio!.image_url)}`
    );
  };

  const handleDonation = async (goalId: string) => {
    if (!donationAmount || isNaN(parseFloat(donationAmount)) || parseFloat(donationAmount) <= 0) {
      alert('Por favor, insira um valor válido para doação.');
      return;
    }

    try {
      const response = await fetch(`/api/advertisements/${id}/goals`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal_id: goalId,
          amount: parseFloat(donationAmount)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process donation');
      }

      const data = await response.json();

      // Update the goals state with the updated goal
      setGoals(goals.map(goal => 
        goal.id === goalId ? data.goal : goal
      ));

      // Reset donation amount
      setDonationAmount('');

      alert('Doação realizada com sucesso! Obrigado pela sua contribuição.');
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Erro ao processar doação. Por favor, tente novamente.'); 
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !anuncio) {
    return (
      <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-xl text-red-600 mb-4">Anúncio não encontrado</p>
            <p className="text-gray-600">{error || "O anúncio solicitado não está disponível."}</p>
            <button 
              onClick={() => router.push('/anuncios')}
              className="mt-6 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition"
            >
              Ver todos os anúncios
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
      <Header />

      <main className="flex-grow container mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-8 p-4 bg-white rounded-lg shadow-lg">
          {/* Left column with image */}
          <div>
            <Image
              src={anuncio.image_url || '/placeholder.jpg'}
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
            
            {/* Location info */}
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
            
            {/* Publisher info */}
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
                    <p className="text-sm text-gray-500">
                      {new Date(anuncio.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact and promote buttons */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Button onClick={toggleContact}>
                  Ver Contacto
                </Button>
                <Button onClick={toggleChat}>
                  Chat com Anunciante
                </Button>
              </div>
              <Button onClick={handlePromote}>
                Promover
              </Button>
            </div>

            {/* Contact information */}
            {showContact && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-md">
                <h3 className="text-lg font-semibold mb-2">Informação de Contacto:</h3>
                {anuncio.contact ? (
                  <div>
                    <p className="flex items-center text-gray-700 mb-2">
                      <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span>Telefone: {anuncio.contact}</span>
                    </p>
                    {anuncio.contact_email && (
                      <p className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                        </svg>
                        <span>Email: {anuncio.contact_email}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-700">Contacto não disponível</p>
                )}
              </div>
            )}

            {/* Chat interface */}
            {showChat && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-md">
                <h3 className="text-lg font-semibold mb-2">Chat com {anuncio.publisher}</h3>
                <div className="h-64 overflow-y-auto bg-white p-3 rounded mb-3">
                  {chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Comece a conversação com o anunciante</p>
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className={`mb-3 ${msg.sender === 'you' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-2 rounded-lg ${msg.sender === 'you' ? 'bg-teal-100' : 'bg-gray-200'}`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && handleSendMessage()}
                    placeholder="Escreva uma mensagem..."
                    className="flex-1 border rounded-l-md p-2"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-teal-500 text-white px-4 py-2 rounded-r-md hover:bg-teal-600 transition disabled:bg-gray-300"
                  >
                    {sendingMessage ? 'A enviar...' : 'Enviar'}
                  </button>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{anuncio.description}</p>
            </div>

            {/* Goals section */}
            {goals.length > 0 && (
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
      className="w-full px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
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
