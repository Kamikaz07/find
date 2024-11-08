// app/(localização onde deseja criar a página)/PaymentPage.tsx

"use client";

import React, { useState } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export default function PaymentPage() {
  const [amount, setAmount] = useState(10); // Valor padrão da doação
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você poderia adicionar integração com uma API de pagamento
    alert(`Pagamento de €${amount} efetuado com sucesso por ${name}!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
      <Header />

      <main className="flex-grow container mx-auto p-4">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Promover</h2>

          <form onSubmit={handlePayment} className="space-y-4">
            {/* Campo para Nome */}
            <div>
              <label htmlFor="name" className="block text-gray-700">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Campo para Email */}
            <div>
              <label htmlFor="email" className="block text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Campo para Valor */}
            <div>
              <label htmlFor="amount" className="block text-gray-700">
                Valor da Doação (€)
              </label>
              <input
                id="amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Botão de Doar */}
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 transition"
            >
              Confirmar Promoção
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
