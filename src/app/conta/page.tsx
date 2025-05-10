"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import Image from 'next/image';
import Swal from 'sweetalert2';

// Types for chat functionality
type Contact = {
  email: string;
  phone?: string;
};

type ChatMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
  advertisement_id?: string;
  product_id?: string;
  advertisements?: {
    title: string;
  };
  products?: {
    title: string;
  };
  sender?: Contact;
  receiver?: Contact;
};

type Conversation = {
  contact: Contact;
  contactId: string;
  latestMessage: ChatMessage;
  unreadCount: number;
};

const ContaPage = () => {
    const [abaAtiva, setAbaAtiva] = useState("anuncios");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    // State for user data and advertisements
    const [user, setUser] = useState({
      id: "",
      nome: "",
      email: "",
      phone: "",
    });
    
    // State for editable user profile
    const [editableUser, setEditableUser] = useState({
      nome: "",
      phone: "",
    });
    
    // State for password change
    const [passwords, setPasswords] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Chat state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    
    type Advertisement = {
      id: string;
      title: string;
      description: string;
      location: string;
      image_url: string;
      publisher: string;
      created_at: string;
      expiration_date?: string | null;
      user_id: string;
    };

    type Product = {
      id: string;
      title: string;
      description: string;
      price: number;
      location: string;
      image_url: string;
      publisher: string;
      created_at: string;
      user_id: string;
    };

    type Goal = {
      id: string;
      advertisement_id: string;
      goal_type: 'donation' | 'delivery';
      target_amount: number;
      current_amount: number;
      created_at: string;
    };

    const [userAnuncios, setUserAnuncios] = useState<Advertisement[]>([]);
    const [userProducts, setUserProducts] = useState<Product[]>([]);
    const [advertisementGoals, setAdvertisementGoals] = useState<{[key: string]: Goal[]}>({});
    const [loadingAnuncios, setLoadingAnuncios] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Proteção da rota e carregamento de dados
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const res = await fetch("/api/auth/session");
          const session = await res.json();

          if (!session?.user) {
            router.push("/login");
          } else {
            // Set user data from session
            setUser({
              id: session.user.id || "",
              nome: session.user.name || "Utilizador",
              email: session.user.email || "",
              phone: "",
            });
            
            // Initialize editable fields
            setEditableUser({
              nome: session.user.name || "Utilizador",
              phone: "",
            });
            
            // Fetch additional user data
            fetchUserData(session.user.email);

            // Fetch user's advertisements and products
            fetchUserAnuncios();
            fetchUserProducts();

            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error checking authentication:", error);
          router.push("/login");
        }
      };

      checkAuth();
    }, [router]);
    
    // Fetch conversations when the contactos tab is active
    useEffect(() => {
      if (abaAtiva === "contactos") {
        fetchConversations();
      }
    }, [abaAtiva]);
    
    // Fetch messages when a conversation is selected
    useEffect(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    }, [selectedConversation]);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
      if (messages.length > 0) {
        const chatContainer = document.getElementById('chat-messages-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }
    }, [messages]);
    
    // Fetch user's conversations
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const response = await fetch('/api/messages');

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        setConversations(data.conversations || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoadingConversations(false);
      }
    };
    
    // Fetch messages for a specific conversation
    const fetchMessages = async (contactId: string) => {
      try {
        setLoadingMessages(true);
        const response = await fetch(`/api/messages?contactId=${contactId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data.messages || []);
        
        // Refresh conversations to update unread counts
        fetchConversations();
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    // Send a message
    const sendMessage = async () => {
      if (!newMessage.trim() || !selectedConversation) return;
      
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiverId: selectedConversation,
            message: newMessage.trim(),
            // We could also include advertisementId or productId if needed
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        // Clear the message input
        setNewMessage('');
        
        // Refresh messages and conversations
        fetchMessages(selectedConversation);
      } catch (error) {
        console.error('Error sending message:', error);
        Swal.fire({
          title: 'Erro',
          text: 'Erro ao enviar mensagem. Tente novamente.',
          icon: 'error',
          confirmButtonColor: '#40B3B3'
        });
      }
    };
    
    // Format message time
    const formatMessageTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    // Format message date (for grouping)
    const formatMessageDate = (dateString: string) => {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ontem';
      } else {
        return date.toLocaleDateString();
      }
    };
    
    // Get conversation name (email or item title)
    const getConversationName = (conversation: Conversation) => {
      if (conversation.latestMessage.advertisement_id && conversation.latestMessage.advertisements?.title) {
        return `Anúncio: ${conversation.latestMessage.advertisements.title}`;
      } else if (conversation.latestMessage.product_id && conversation.latestMessage.products?.title) {
        return `Produto: ${conversation.latestMessage.products.title}`;
      } else {
        return conversation.contact.email;
      }
    };
    
    // Fetch additional user data
    const fetchUserData = async (email: string) => {
      try {
        const response = await fetch('/api/users/current');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.user) {
            setUser(prev => ({
              ...prev,
              phone: data.user.phone || "",
            }));
            
            setEditableUser(prev => ({
              ...prev,
              phone: data.user.phone || "",
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    // Fetch user's advertisements
    const fetchUserAnuncios = async () => {
      try {
        setLoadingAnuncios(true);
        const response = await fetch('/api/advertisements/user');

        if (!response.ok) {
          throw new Error('Failed to fetch advertisements');
        }

        const data = await response.json();
        setUserAnuncios(data.advertisements || []);
        
        // Fetch goals for each advertisement
        for (const anuncio of data.advertisements || []) {
          fetchAnuncioGoals(anuncio.id);
        }
      } catch (error) {
        console.error('Error fetching user advertisements:', error);
      } finally {
        setLoadingAnuncios(false);
      }
    };
    
    // Fetch goals for a specific advertisement
    const fetchAnuncioGoals = async (anuncioId: string) => {
      try {
        const response = await fetch(`/api/advertisements/${anuncioId}/goals`);
        
        if (!response.ok) {
          return; // Silently ignore errors for individual goal fetches
        }
        
        const data = await response.json();
        if (data.goals && data.goals.length > 0) {
          setAdvertisementGoals(prev => ({
            ...prev,
            [anuncioId]: data.goals
          }));
        }
      } catch (error) {
        console.error(`Error fetching goals for advertisement ${anuncioId}:`, error);
      }
    };
    
    // Fetch user's products
    const fetchUserProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch('/api/products/user');

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setUserProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching user products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    // Handle profile update
    const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      
      try {
        const response = await fetch('/api/users/current', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editableUser.nome,
            phone: editableUser.phone,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        
        // Update user state with new values
        setUser(prev => ({
          ...prev,
          nome: editableUser.nome,
          phone: editableUser.phone,
        }));
        
        Swal.fire({
          title: 'Sucesso!',
          text: 'Perfil atualizado com sucesso!',
          icon: 'success',
          confirmButtonColor: '#40B3B3'
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        Swal.fire({
          title: 'Erro',
          text: 'Ocorreu um erro ao atualizar o perfil. Tente novamente.',
          icon: 'error',
          confirmButtonColor: '#40B3B3'
        });
      } finally {
        setIsSaving(false);
      }
    };
    
    // Handle password change
    const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validate passwords
      if (passwords.newPassword !== passwords.confirmPassword) {
        Swal.fire({
          title: 'Erro',
          text: 'As novas passwords não correspondem.',
          icon: 'error',
          confirmButtonColor: '#40B3B3'
        });
        return;
      }
      
      if (passwords.newPassword.length < 9) {
        Swal.fire({
          title: 'Erro',
          text: 'A nova password deve ter pelo menos 9 caracteres.',
          icon: 'error',
          confirmButtonColor: '#40B3B3'
        });
        return;
      }
      
      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{9,}$/;
      if (!passwordRegex.test(passwords.newPassword)) {
        Swal.fire({
          title: 'Erro',
          text: 'A nova password deve ter pelo menos 9 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.',
          icon: 'error',
          confirmButtonColor: '#40B3B3'
        });
        return;
      }
      
      setIsSaving(true);
      
      try {
        const response = await fetch('/api/users/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update password');
        }
        
        // Reset password fields
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        
        Swal.fire({
          title: 'Sucesso!',
          text: 'Password atualizada com sucesso!',
          icon: 'success',
          confirmButtonColor: '#40B3B3'
        });
      } catch (error: any) {
        console.error('Error updating password:', error);
        Swal.fire({
          title: 'Erro',
          text: error.message || 'Ocorreu um erro ao atualizar a password. Tente novamente.',
          icon: 'error',
          confirmButtonColor: '#40B3B3'
        });
      } finally {
        setIsSaving(false);
      }
    };

    // Delete advertisement
    const deleteAnuncio = async (id: string) => {
      // Substituir confirm por SweetAlert2
      const result = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Deseja excluir este anúncio? Esta ação não pode ser revertida.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#40B3B3',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }

      // Mostrar loading durante a exclusão
      Swal.fire({
        title: 'Excluindo anúncio',
        text: 'Por favor, aguarde...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch(`/api/advertisements/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete advertisement');
        }

        // Refresh the list
        fetchUserAnuncios();
        
        // Substituir alert por SweetAlert2
        Swal.fire({
          title: 'Sucesso!',
          text: 'Anúncio excluído com sucesso!',
          icon: 'success',
          confirmButtonColor: '#40B3B3'
        });
      } catch (error) {
        console.error('Error deleting advertisement:', error);
        
        // Substituir alert por SweetAlert2
        Swal.fire({
          title: 'Erro',
          text: 'Erro ao excluir anúncio. Tente novamente.',
          icon: 'error',
          confirmButtonColor: '#40B3B3'
        });
      }
    };
    
    // Delete product
    const deleteProduct = async (id: string) => {
      // Substituir confirm por SweetAlert2
      const result = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Deseja excluir este produto? Esta ação não pode ser revertida.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#40B3B3',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }

      // Mostrar loading durante a exclusão
      Swal.fire({
        title: 'Excluindo produto',
        text: 'Por favor, aguarde...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        // Refresh the list
        fetchUserProducts();
        
        // Substituir alert por SweetAlert2
        Swal.fire({
          title: 'Sucesso!',
          text: 'Produto excluído com sucesso!',
          icon: 'success',
          confirmButtonColor: '#40B3B3'
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        
        // Substituir alert por SweetAlert2
        Swal.fire({
          title: 'Erro',
          text: 'Erro ao excluir produto. Tente novamente.',
          icon: 'error',
          confirmButtonColor: '#40B3B3'
        });
      }
    };
    
    // Format price as currency
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    };
    
    // Format date with expiration indication
    const formatDate = (dateString: string, expirationDate?: string | null) => {
      const date = new Date(dateString).toLocaleDateString();
      
      if (expirationDate) {
        const expDate = new Date(expirationDate);
        const today = new Date();
        const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiration <= 0) {
          return `${date} (Expirado)`;
        } else if (daysUntilExpiration === 1) {
          return `${date} (Expira em 1 dia)`;
        } else {
          return `${date} (Expira em ${daysUntilExpiration} dias)`;
        }
      }
      
      return date;
    };
    
    // Check if advertisement is expired
    const isExpired = (expirationDate?: string | null) => {
      if (!expirationDate) return false;
      
      const expDate = new Date(expirationDate);
      const today = new Date();
      return expDate < today;
    };

    if (isLoading) return (
      <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
        <Footer />
      </div>
    );

    return (
      <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-teal-800 mb-6">A Minha Conta</h1>

          <div className="flex space-x-6 border-b border-teal-300 mb-6 text-teal-700 font-semibold text-lg">
            <button
              onClick={() => setAbaAtiva("anuncios")}
              className={`pb-2 transition ${
                abaAtiva === "anuncios"
                  ? "border-b-4 border-teal-600 text-teal-800"
                  : "hover:text-teal-900"
              }`}
            >
              Meus Anúncios
            </button>
            <button
              onClick={() => setAbaAtiva("produtos")}
              className={`pb-2 transition ${
                abaAtiva === "produtos"
                  ? "border-b-4 border-teal-600 text-teal-800"
                  : "hover:text-teal-900"
              }`}
            >
              Meus Produtos
            </button>
            <button
              onClick={() => setAbaAtiva("contactos")}
              className={`pb-2 transition ${
                abaAtiva === "contactos"
                  ? "border-b-4 border-teal-600 text-teal-800"
                  : "hover:text-teal-900"
              }`}
            >
              Contactos
            </button>
            <button
              onClick={() => setAbaAtiva("perfil")}
              className={`pb-2 transition ${
                abaAtiva === "perfil"
                  ? "border-b-4 border-teal-600 text-teal-800"
                  : "hover:text-teal-900"
              }`}
            >
              Perfil
            </button>
          </div>

          {/* Anúncios tab */}
          {abaAtiva === "anuncios" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              {loadingAnuncios ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : userAnuncios.length === 0 ? (
                <>
                  <p className="text-teal-700 mb-4">Ainda não há nenhum anúncio publicado.</p>
                  <Link
                    href="/anunciar"
                    className="inline-block bg-teal-600 text-white px-6 py-2 rounded-md shadow hover:bg-teal-700 transition"
                  >
                    Criar Anúncio
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-teal-800">Meus Anúncios</h2>
                    <Link
                      href="/anunciar"
                      className="bg-teal-600 text-white px-4 py-2 rounded-md shadow hover:bg-teal-700 transition text-sm"
                    >
                      Novo Anúncio
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {userAnuncios.map((anuncio) => (
                      <div 
                        key={anuncio.id} 
                        className={`border rounded-lg p-4 hover:bg-gray-50 ${isExpired(anuncio.expiration_date) ? 'border-red-300 bg-red-50' : ''}`}
                      >
                        <div className="md:flex gap-4">
                          <div className="md:w-1/4 mb-3 md:mb-0">
                            <Image
                              src={anuncio.image_url || '/placeholder.jpg'}
                              alt={anuncio.title}
                              width={150}
                              height={100}
                              className="w-full h-24 object-cover rounded-md"
                            />
                          </div>
                          <div className="md:w-3/4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-teal-700">{anuncio.title}</h3>
                                <p className="text-sm text-gray-600">{anuncio.location}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Link
                                  href={`/anuncio/${anuncio.id}`}
                                  className="text-teal-600 hover:text-teal-800"
                                >
                                  Ver
                                </Link>
                                <Link
                                  href={`/anuncio/editar/${anuncio.id}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Editar
                                </Link>
                                <button
                                  onClick={() => deleteAnuncio(anuncio.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">{anuncio.description}</p>
                            
                            {/* Display goals if any exist */}
                            {advertisementGoals[anuncio.id] && advertisementGoals[anuncio.id].length > 0 && (
                              <div className="mt-2 bg-gray-50 p-2 rounded-md">
                                {advertisementGoals[anuncio.id].map(goal => (
                                  <div key={goal.id} className="text-xs flex items-center">
                                    <span className="font-medium mr-2">
                                      {goal.goal_type === 'donation' ? 'Doação:' : 'Entregas:'}
                                    </span>
                                    <div className="flex-grow bg-gray-200 h-2 rounded-full">
                                      <div 
                                        className="bg-teal-500 h-2 rounded-full" 
                                        style={{ width: `${Math.min(100, (goal.current_amount / goal.target_amount) * 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="ml-2 text-teal-700">
                                      {new Intl.NumberFormat('pt-PT', {
                                        style: 'currency',
                                        currency: 'EUR'
                                      }).format(goal.current_amount)} / {new Intl.NumberFormat('pt-PT', {
                                        style: 'currency',
                                        currency: 'EUR'
                                      }).format(goal.target_amount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-2">
                              {isExpired(anuncio.expiration_date) ? (
                                <span className="text-red-600 font-semibold">EXPIRADO - Criado em: {formatDate(anuncio.created_at)}</span>
                              ) : (
                                `Criado em: ${formatDate(anuncio.created_at, anuncio.expiration_date)}`
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Produtos tab */}
          {abaAtiva === "produtos" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              {loadingProducts ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : userProducts.length === 0 ? (
                <>
                  <p className="text-teal-700 mb-4">Ainda não há nenhum produto publicado.</p>
                  <Link
                    href="/vender"
                    className="inline-block bg-teal-600 text-white px-6 py-2 rounded-md shadow hover:bg-teal-700 transition"
                  >
                    Vender Produto
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-teal-800">Meus Produtos</h2>
                    <Link
                      href="/vender"
                      className="bg-teal-600 text-white px-4 py-2 rounded-md shadow hover:bg-teal-700 transition text-sm"
                    >
                      Novo Produto
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {userProducts.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="md:flex gap-4">
                          <div className="md:w-1/4 mb-3 md:mb-0">
                            <Image
                              src={product.image_url || '/placeholder.jpg'}
                              alt={product.title}
                              width={150}
                              height={100}
                              className="w-full h-24 object-cover rounded-md"
                            />
                          </div>
                          <div className="md:w-3/4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-teal-700">{product.title}</h3>
                                <p className="text-sm font-semibold text-teal-600">{formatPrice(product.price)}</p>
                                <p className="text-sm text-gray-600">{product.location}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Link
                                  href={`/produto/${product.id}`}
                                  className="text-teal-600 hover:text-teal-800"
                                >
                                  Ver
                                </Link>
                                <button
                                  onClick={() => deleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Criado em: {new Date(product.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Contactos tab */}
          {abaAtiva === "contactos" && (
            <div className="bg-white rounded-lg shadow-md">
              {loadingConversations ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6">
                  <p className="text-teal-700">Nenhum contacto recente encontrado.</p>
                  <p className="text-gray-600 mt-2">Quando enviar ou receber mensagens através de um anúncio ou produto, as suas conversas irão aparecer aqui.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 h-[600px]">
                  {/* Conversations list */}
                  <div className="border-r">
                    <h2 className="p-4 font-semibold text-lg border-b">Conversas</h2>
                    <div className="overflow-y-auto h-[556px]">
                      {conversations.map(conversation => (
                        <div 
                          key={conversation.contactId}
                          onClick={() => setSelectedConversation(conversation.contactId)}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                            selectedConversation === conversation.contactId ? 'bg-gray-100' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{conversation.contact.email}</p>
                              <p className="text-sm text-gray-600 truncate">{getConversationName(conversation)}</p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-teal-600 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[1.5rem] text-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-1">{conversation.latestMessage.message}</p>
                          <p className="text-xs text-right text-gray-400 mt-1">
                            {formatMessageTime(conversation.latestMessage.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Messages area */}
                  <div className="md:col-span-2 flex flex-col">
                    {selectedConversation ? (
                      <>
                        {/* Conversation header */}
                        <div className="p-4 border-b flex items-center">
                          <div>
                            <p className="font-semibold">
                              {conversations.find(c => c.contactId === selectedConversation)?.contact.email || 'Contacto'}
                            </p>
                            {conversations.find(c => c.contactId === selectedConversation)?.contact.phone && (
                              <p className="text-sm text-gray-600">
                                {conversations.find(c => c.contactId === selectedConversation)?.contact.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Messages container */}
                        <div id="chat-messages-container" className="flex-grow overflow-y-auto p-4">
                          {loadingMessages ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Group messages by date */}
                              {(() => {
                                let currentDate = '';
                                return messages.map((msg, index) => {
                                  const isOwnMessage = msg.sender_id === user.id;
                                  const messageDate = formatMessageDate(msg.created_at);
                                  const showDateHeader = messageDate !== currentDate;
                                  
                                  if (showDateHeader) {
                                    currentDate = messageDate;
                                  }
                                  
                                  return (
                                    <div key={msg.id}>
                                      {showDateHeader && (
                                        <div className="flex justify-center my-4">
                                          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                                            {messageDate}
                                          </span>
                                        </div>
                                      )}
                                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-lg p-3 ${
                                          isOwnMessage 
                                            ? 'bg-teal-100 text-teal-900' 
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                          <p>{msg.message}</p>
                                          <p className="text-xs text-right mt-1 opacity-70">
                                            {formatMessageTime(msg.created_at)}
                                            {isOwnMessage && (
                                              <span className="ml-1">
                                                {msg.read ? '✓✓' : '✓'}
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Message input */}
                        <div className="p-4 border-t">
                          <div className="flex">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                              placeholder="Escreva uma mensagem..."
                              className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <button
                              onClick={sendMessage}
                              disabled={!newMessage.trim()}
                              className="bg-teal-500 text-white px-4 py-2 rounded-r-md hover:bg-teal-600 transition disabled:bg-gray-300"
                            >
                              Enviar
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-center">Selecione uma conversa para começar a falar</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Perfil tab */}
          {abaAtiva === "perfil" && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h2 className="text-xl font-semibold text-teal-800 mb-4">Informações da Conta</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-teal-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 rounded-md" 
                  />
                  <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado.</p>
                </div>
                
                <div>
                  <label htmlFor="nome" className="block text-sm font-semibold text-teal-700 mb-1">Nome</label>
                  <input 
                    type="text" 
                    id="nome" 
                    value={editableUser.nome}
                    onChange={(e) => setEditableUser({...editableUser, nome: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-teal-700 mb-1">Telemóvel</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={editableUser.phone}
                    onChange={(e) => setEditableUser({...editableUser, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="bg-teal-600 text-white px-6 py-2 rounded-md shadow hover:bg-teal-700 transition disabled:opacity-70"
                  disabled={isSaving}
                >
                  {isSaving ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </form>
              
              <hr className="my-6 border-gray-200" />
              
              <h2 className="text-xl font-semibold text-teal-800 mb-4">Alterar Password</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-semibold text-teal-700 mb-1">Password Atual</label>
                  <input 
                    type="password" 
                    id="currentPassword" 
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-teal-700 mb-1">Nova Password</label>
                  <input 
                    type="password" 
                    id="newPassword" 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  />
                  <p className="text-xs text-gray-500 mt-1">A password deve ter pelo menos 9 caracteres, incluindo letras maiúsculas, minúsculas e números.</p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-teal-700 mb-1">Confirmar Nova Password</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="bg-teal-600 text-white px-6 py-2 rounded-md shadow hover:bg-teal-700 transition disabled:opacity-70"
                  disabled={isSaving}
                >
                  {isSaving ? 'A processar...' : 'Alterar Password'}
                </button>
              </form>
            </div>
          )}
        </main>

        <Footer />
      </div>
    );
  };

  export default ContaPage;
