'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

export const Header: React.FC = () => {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  const userName = session?.user?.name || session?.user?.email;

  return (
    <header className="bg-[#40B3B3] text-white p-4 relative z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.jpg" alt="logo" width={80} height={80} />
        </Link>

        <nav className="flex items-center space-x-6 relative">
          <Link href="/" className="hover:text-gray-300 transition-colors">Início</Link>
          <Link href="/sobre" className="hover:text-gray-300 transition-colors">Sobre Nós</Link>
          <Link href="/anuncios" className="hover:text-gray-300 transition-colors">Anúncios</Link>
          <Link href="/mercado" className="hover:text-gray-300 transition-colors">Mercado</Link>

          {/* A Minha Conta com dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <Link href="/conta" className="hover:text-gray-300 transition-colors">
              A Minha Conta
            </Link>

            <div
              className={`absolute left-0 mt-0 w-32 rounded shadow-lg p-4 bg-[#E0F4F4] text-black transition-all duration-200 ${
                showDropdown ? 'block' : 'hidden'
              }`}
            >
              {session ? (
                <>
                <a href='/conta'>
                  <p className="font-bold mb-2">{userName}</p>
                  </a>
                  <ul className="space-y-1 text-sm">
                    <li><Link href="/anuncios" className="block hover:text-[#40B3B3]">Meus Anúncios</Link></li>
                    <li><Link href="/contacto" className="block hover:text-[#40B3B3]">Contactos</Link></li>
                    <li><Link href="/dados" className="block hover:text-[#40B3B3]">Perfil</Link></li>
                    <hr className="my-2" />
                    <li>
                      <button
                        onClick={() => signOut()}
                        className="text-red-500 hover:underline"
                      >
                        Sair
                      </button>
                    </li>
                  </ul>
                </>
              ) : (
                <Link href="/login" className="block hover:text-[#40B3B3]">Entrar</Link>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};