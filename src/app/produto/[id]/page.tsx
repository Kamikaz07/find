"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Swal from 'sweetalert2';

type Product = {
  id: string;
  title: string;
  image_url: string;
  price: number;
  location: string;
  description: string;
  publisher: string;
  created_at: string;
  contact?: string;
  contact_email?: string;
  user_id?: string;
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
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        setProduct(data.product);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Initialize empty messages array for chat
  const initializeChat = () => {
    setChatMessages([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session || !product?.user_id) return;
    
    try {
      setSendingMessage(true);
      
      // Send the message via the API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: product.user_id,
          message: newMessage.trim(),
          productId: product.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
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
    } catch (error) {
      console.error('Error sending message:', error);
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao enviar mensagem. Tente novamente.',
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
        text: 'Precisa fazer login para contactar o vendedor.',
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
      initializeChat();
    }
    setShowChat(!showChat);
    setShowContact(false);
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

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-xl text-red-600 mb-4">Produto não encontrado</p>
            <p className="text-gray-600">{error || "O produto solicitado não está disponível."}</p>
            <button 
              onClick={() => router.push('/mercado')}
              className="mt-6 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition"
            >
              Ver todos os produtos
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
          <div>
            <Image
              src={product.image_url || '/placeholder.jpg'}
              alt={product.title}
              className="w-full h-auto rounded-lg shadow-md"
              width={500}
              height={300}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">{product.title}</h2>
              <p className="text-3xl font-bold text-teal-600 mt-2">
                {formatPrice(product.price)}
              </p>
              <p className="text-xl font-semibold text-teal-700 mt-2">
                {product.location}
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
              <span>{product.location}</span>
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
                    <h3 className="font-semibold">Vendido por {product.publisher}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact and chat buttons */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Button onClick={toggleContact}>
                  Ver Contacto
                </Button>
                <Button onClick={toggleChat}>
                  Chat com Vendedor
                </Button>
              </div>
            </div>

            {/* Contact information */}
            {showContact && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-md">
                <h3 className="text-lg font-semibold mb-2">Informação de Contacto:</h3>
                {product.contact ? (
                  <div>
                    <p className="flex items-center text-gray-700 mb-2">
                      <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span>Telefone: {product.contact}</span>
                    </p>
                    {product.contact_email && (
                      <p className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                        </svg>
                        <span>Email: {product.contact_email}</span>
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
                <h3 className="text-lg font-semibold mb-2">Chat com {product.publisher}</h3>
                <div className="h-64 overflow-y-auto bg-white p-3 rounded mb-3">
                  {chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Comece a conversação com o vendedor</p>
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

            <div>
              <h3 className="text-xl font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
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