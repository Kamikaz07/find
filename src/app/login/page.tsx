'use client';

import { useState, Suspense } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import LoginForm from './login-form';
import RegisterForm from './register-form'; // placeholder para criação de conta

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          {/* Tabs */}
          <div className="flex justify-center space-x-6 mb-6 font-semibold text-teal-700">
            <button
              onClick={() => setTab('login')}
              className={`pb-1 ${tab === 'login' ? 'border-b-2 border-teal-600' : 'text-gray-500'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setTab('register')}
              className={`pb-1 ${tab === 'register' ? 'border-b-2 border-teal-600' : 'text-gray-500'}`}
            >
              Criar conta
            </button>
          </div>

          {/* Formulários */}
          <Suspense>
            {tab === 'login' ? <LoginForm /> : <RegisterForm />}
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}