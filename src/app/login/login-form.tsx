'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const res = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    });

    if (res?.error) {
      setError('Email ou password inválidos');
    } else {
      router.push('/anunciar');
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
        <label htmlFor="email" className="block text-sm font-medium text-teal-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-teal-700">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        />
        <p className="text-[0.7rem] text-gray-500 mt-1">
          <a href="/recuperar-password" className="hover:underline">
            Esqueceste-te da password?
          </a>
        </p>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 transition"
      >
        Entrar
      </button>
    </form>
  );
}
