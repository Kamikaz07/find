'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    try {
      // Register the user
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          receiveUpdates 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao registar');
      }

      // Auto login after successful registration
      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError('Conta criada, mas falha ao iniciar sessão automática. Por favor faça login.');
      } else {
        router.push('/anunciar');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-100 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-teal-700">Email</label>
        <input 
          type="email" 
          name="email" 
          id="email"
          required 
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm" 
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-teal-700">Password</label>
        <input 
          type="password" 
          name="password"
          id="password" 
          required 
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm" 
        />
        <p className="text-[0.7rem] text-gray-500 mt-1 leading-tight">
          A tua password deve ter: mínimo 9 caracteres, letra maiúscula, minúscula e número.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input 
          type="checkbox"
          id="receiveUpdates"
          checked={receiveUpdates}
          onChange={(e) => setReceiveUpdates(e.target.checked)} 
          className="border rounded" 
        />
        <label htmlFor="receiveUpdates" className="text-sm">Quero receber atualizações por email</label>
      </div>
      <button 
        type="submit" 
        className="w-full rounded-md bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 transition"
        disabled={loading}
      >
        {loading ? 'A processar...' : 'Criar conta'}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Ao clicar em &quot;Criar conta&quot;, aceitas os <a className="underline" href="#">Termos e Condições</a> e a <a className="underline" href="#">Política de Privacidade</a>.
      </p>
    </form>
  );
}