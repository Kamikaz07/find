'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  
  // Password validation state
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4 scale
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });

  // Check password requirements in real-time
  useEffect(() => {
    const requirements = {
      length: password.length >= 9,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
    
    setPasswordRequirements(requirements);
    
    // Calculate strength (0-4)
    const strength = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(strength);
  }, [password]);

  // Get color based on password strength
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const formPassword = form.get('password') as string;
    const phone = form.get('phone') as string;
    
    // Ensure password meets all requirements
    if (passwordStrength < 4) {
      setError('Por favor, corrija os requisitos de password indicados abaixo.');
      setLoading(false);
      return;
    }

    try {
      // Register the user
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password: formPassword,
          phone,
          receiveUpdates 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Add a delay before allowing another attempt
          setTimeout(() => setLoading(false), 30000); // 30 seconds
          throw new Error('Por favor, aguarde alguns segundos antes de tentar novamente.');
        }
        throw new Error(data.error || 'Ocorreu um erro ao registar');
      }

      // Auto login after successful registration
      const loginRes = await signIn('credentials', {
        email,
        password: formPassword,
        redirect: false,
      });

      if (loginRes?.error) {
        setError('Conta criada, mas falha ao iniciar sessão automática. Por favor faça login.');
      } else {
        router.push('/anunciar');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao registar');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-100 border-l-4 border-red-500 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          type="email" 
          name="email" 
          id="email"
          required 
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-teal-500 focus:border-teal-500 shadow-sm transition duration-150 ease-in-out" 
          placeholder="exemplo@email.com"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telemóvel</label>
        <input 
          type="tel" 
          name="phone" 
          id="phone"
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-teal-500 focus:border-teal-500 shadow-sm transition duration-150 ease-in-out" 
          placeholder="+351 999 999 999"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input 
          type="password" 
          name="password"
          id="password" 
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-teal-500 focus:border-teal-500 shadow-sm transition duration-150 ease-in-out" 
        />
        
        {/* Password strength meter */}
        <div className="mt-2 mb-1">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getStrengthColor()} transition-all duration-300 ease-out`} 
              style={{ width: `${passwordStrength * 25}%` }} 
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {passwordStrength === 0 && 'Insira uma password'}
            {passwordStrength === 1 && 'Password muito fraca'}
            {passwordStrength === 2 && 'Password fraca'}
            {passwordStrength === 3 && 'Password média'}
            {passwordStrength === 4 && 'Password forte'}
          </p>
        </div>
        
        {/* Password requirements indicators */}
        <div className="text-xs space-y-1 mt-2">
          <p className="font-medium text-gray-700">A password deve ter:</p>
          <ul className="space-y-1 pl-1">
            <li className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
              {passwordRequirements.length ? (
                <svg className="w-3.5 h-3.5 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"></path>
                </svg>
              )}
              No mínimo 9 caracteres
            </li>
            <li className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
              {passwordRequirements.uppercase ? (
                <svg className="w-3.5 h-3.5 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"></path>
                </svg>
              )}
              Uma letra maiúscula
            </li>
            <li className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
              {passwordRequirements.lowercase ? (
                <svg className="w-3.5 h-3.5 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"></path>
                </svg>
              )}
              Uma letra minúscula
            </li>
            <li className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
              {passwordRequirements.number ? (
                <svg className="w-3.5 h-3.5 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"></path>
                </svg>
              )}
              Um número
            </li>
          </ul>
        </div>
      </div>
      <div className="flex items-center space-x-3 mt-6">
        <input 
          type="checkbox"
          id="receiveUpdates"
          checked={receiveUpdates}
          onChange={(e) => setReceiveUpdates(e.target.checked)} 
          className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 shadow-sm transition duration-150 ease-in-out" 
        />
        <label htmlFor="receiveUpdates" className="text-sm font-medium text-gray-700">Quero receber atualizações por email</label>
      </div>
      <button 
        type="submit" 
        className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50"
        disabled={loading || passwordStrength < 4}
      >
        {loading ? 'A processar...' : 'Criar conta'}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Ao clicar em &quot;Criar conta&quot;, aceitas os <a className="underline text-teal-600 hover:text-teal-800" href="#">Termos e Condições</a> e a <a className="underline text-teal-600 hover:text-teal-800" href="#">Política de Privacidade</a>.
      </p>
    </form>
  );
}