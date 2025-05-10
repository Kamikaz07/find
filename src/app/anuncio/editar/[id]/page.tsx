'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "../../../../components/Header";
import { Footer } from "../../../../components/Footer";
import Image from "next/image";
import Swal from 'sweetalert2';

interface AdData {
  title: string;
  location: string;
  publisher: string;
  description: string;
  image_url?: string | null;
  is_public: boolean;
  expiration_date?: string | null;
}

interface Goal {
  id: string;
  advertisement_id: string;
  goal_type: 'donation' | 'delivery';
  target_amount: number;
  current_amount: number;
  created_at: string;
  updated_at: string;
}

const EditarAnuncioPage = () => {
  const [formData, setFormData] = useState<AdData>({
    title: "",
    location: "",
    publisher: "",
    description: "",
    image_url: null,
    is_public: true,
    expiration_date: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Advertisement goals state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [goal, setGoal] = useState<Goal | null>(null);
  const [includeGoal, setIncludeGoal] = useState(false);
  const [goalType, setGoalType] = useState<'donation' | 'delivery'>('donation');
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState(0);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const [goalExists, setGoalExists] = useState(false);

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      setIsLoading(true);
      try {
        const authRes = await fetch("/api/auth/session");
        const session = await authRes.json();
        if (!session?.user) {
          router.push("/login");
          return;
        }

        if (id) {
          // Fetch advertisement data
          const adRes = await fetch(`/api/advertisements/${id}`);
          if (!adRes.ok) {
            const errorData = await adRes.json();
            throw new Error(errorData.error || "Falha ao carregar dados do anúncio");
          }
          const { advertisement } = await adRes.json();
          setFormData({
            title: advertisement.title || "",
            location: advertisement.location || "",
            publisher: advertisement.publisher || "",
            description: advertisement.description || "",
            image_url: advertisement.image_url,
            is_public: advertisement.is_public === undefined ? true : advertisement.is_public,
            expiration_date: advertisement.expiration_date ? new Date(advertisement.expiration_date).toISOString().split('T')[0] : "",
          });
          if (advertisement.image_url) {
            setImagePreview(advertisement.image_url);
          }

          // Fetch advertisement goals
          const goalsRes = await fetch(`/api/advertisements/${id}/goals`);
          if (goalsRes.ok) {
            const { goals } = await goalsRes.json();
            if (goals && goals.length > 0) {
              const existingGoal = goals[0]; // Use the first goal (usually there's only one per ad)
              setGoal(existingGoal);
              setGoalType(existingGoal.goal_type);
              setTargetAmount(existingGoal.target_amount.toString());
              setCurrentAmount(existingGoal.current_amount);
              setIncludeGoal(true);
              setGoalExists(true);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching ad data:", err);
        Swal.fire('Erro ao Carregar', err instanceof Error ? err.message : 'Não foi possível carregar os dados do anúncio.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      checkAuthAndFetchData();
    } else {
      router.push('/conta'); // Or some error page if ID is missing
    }
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        Swal.fire('Ficheiro Inválido', 'Por favor, selecione um ficheiro de imagem.', 'warning');
        setImageFile(null);
      }
    }
  };

  const handleGoalChange = async () => {
    if (isUpdatingGoal) return;
    
    setIsUpdatingGoal(true);
    
    try {
      if (!includeGoal && goalExists) {
        // Should implement a delete goal endpoint
        Swal.fire('Aviso', 'A remoção de metas não está disponível no momento.', 'info');
        setIncludeGoal(true); // Revert back since we can't delete
        setIsUpdatingGoal(false);
        return;
      }
      
      if (includeGoal && !goalExists) {
        // Validate goal amount
        const amount = parseFloat(targetAmount);
        if (isNaN(amount) || amount <= 0) {
          Swal.fire('Meta Inválida', 'Por favor, insira um valor válido maior que zero para a meta.', 'warning');
          setIsUpdatingGoal(false);
          return;
        }
        
        // Create new goal
        const response = await fetch(`/api/advertisements/${id}/goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal_type: goalType,
            target_amount: parseFloat(targetAmount),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao criar meta.');
        }
        
        const { goal: newGoal } = await response.json();
        setGoal(newGoal);
        setGoalExists(true);
        Swal.fire('Sucesso', 'Meta adicionada com sucesso!', 'success');
      }
    } catch (err) {
      console.error("Error updating goal:", err);
      Swal.fire('Erro', err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar a meta.', 'error');
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.location || !formData.publisher || !formData.description) {
      Swal.fire('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    // Validate goal if included but doesn't exist yet
    if (includeGoal && !goalExists) {
      const amount = parseFloat(targetAmount);
      if (isNaN(amount) || amount <= 0) {
        Swal.fire('Meta Inválida', 'Por favor, insira um valor válido maior que zero para a meta.', 'warning');
        return;
      }
    }

    Swal.fire({
      title: 'Atualizando Anúncio...',
      text: 'Por favor, aguarde.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      // Handle image upload if needed
      let currentImageUrl = formData.image_url;
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: imageFormData });
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Falha ao carregar nova imagem.');
        }
        const uploadData = await uploadResponse.json();
        currentImageUrl = uploadData.url;
      }

      // Update the advertisement
      const response = await fetch(`/api/advertisements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          image_url: currentImageUrl,
          expiration_date: formData.expiration_date || null 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar anúncio.');
      }

      // Handle goal creation if needed
      if (includeGoal && !goalExists) {
        const goalResponse = await fetch(`/api/advertisements/${id}/goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal_type: goalType,
            target_amount: parseFloat(targetAmount),
          }),
        });

        if (!goalResponse.ok) {
          const errorData = await goalResponse.json();
          Swal.fire(
            'Anúncio Atualizado com Aviso', 
            `O anúncio foi atualizado, mas houve um problema ao adicionar a meta: ${errorData.error || 'Erro desconhecido'}`,
            'warning'
          ).then(() => router.push("/anuncios"));
          return;
        }
      }

      Swal.fire('Sucesso!', 'Anúncio atualizado com sucesso!', 'success')
        .then(() => router.push('/conta'));

    } catch (err) {
      console.error('Error updating advertisement:', err);
      Swal.fire('Erro ao Atualizar', err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.', 'error');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#E0F4F4] py-10 px-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-teal-700">
            Editar Anúncio
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                Título do Anúncio
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
                Publicado por (Nome da organização ou pessoa)
              </label>
              <input
                id="publisher"
                name="publisher"
                type="text"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
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

            {/* Advertisement Goals Section */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  id="includeGoal"
                  type="checkbox"
                  checked={includeGoal}
                  onChange={(e) => {
                    setIncludeGoal(e.target.checked);
                    handleGoalChange();
                  }}
                  className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 shadow-sm transition duration-150 ease-in-out"
                  disabled={goalExists} // Can't uncheck if goal already exists
                />
                <label htmlFor="includeGoal" className="text-sm font-medium text-gray-700">
                  {goalExists ? "Este anúncio tem uma meta" : "Adicionar Meta ao Anúncio?"}
                </label>
              </div>

              {includeGoal && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  {/* Goal progress display if goal exists */}
                  {goalExists && (
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Progresso da Meta: {currentAmount} de {targetAmount} {goalType === "donation" ? "€" : "unidades"}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {Math.min(100, Math.round((currentAmount / parseFloat(targetAmount)) * 100))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-teal-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, Math.round((currentAmount / parseFloat(targetAmount)) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Meta
                    </label>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          id="donation"
                          type="radio"
                          name="goalType"
                          value="donation"
                          checked={goalType === "donation"}
                          onChange={() => setGoalType("donation")}
                          className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                          disabled={goalExists} // Can't change type if goal exists
                        />
                        <label htmlFor="donation" className="ml-2 text-sm text-gray-700">
                          Doação (€)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="delivery"
                          type="radio"
                          name="goalType"
                          value="delivery"
                          checked={goalType === "delivery"}
                          onChange={() => setGoalType("delivery")}
                          className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                          disabled={goalExists} // Can't change type if goal exists
                        />
                        <label htmlFor="delivery" className="ml-2 text-sm text-gray-700">
                          Entrega (Unidades)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="targetAmount">
                      Meta ({goalType === "donation" ? "em €" : "em unidades"})
                    </label>
                    <input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                      placeholder={goalType === "donation" ? "Valor em euros" : "Quantidade em unidades"}
                      disabled={goalExists} // Can't change amount if goal exists
                      required={includeGoal && !goalExists}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expiration_date">
                Data de Expiração (opcional)
              </label>
              <input
                id="expiration_date"
                name="expiration_date"
                type="date"
                value={formData.expiration_date || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem
              </label>
              
              <div className="mt-1 flex items-center mb-4">
                {imagePreview ? (
                  <div className="relative h-40 w-40 rounded-md overflow-hidden">
                    <Image
                      fill
                      src={imagePreview}
                      alt="Imagem do anúncio"
                      className="object-cover"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-md bg-gray-100">
                    <span className="text-gray-500">Sem imagem</span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image">
                  {formData.image_url ? "Alterar imagem" : "Adicionar imagem"}
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                id="is_public"
                name="is_public"
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 shadow-sm transition duration-150 ease-in-out"
              />
              <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                Anúncio público
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/conta')}
                className="px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out"
              >
                Atualizar
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditarAnuncioPage;
