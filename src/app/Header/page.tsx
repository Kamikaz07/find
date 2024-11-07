import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#40B3B3] text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <Link href="/">
          <Image src="/logo.jpg" alt="logo" width={80} height={80}/>
          </Link>
        </h1>
        <nav className="flex items-center space-x-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">Início</Link>
          <Link href="/sobre" className="hover:text-gray-300 transition-colors">Sobre Nós</Link>
          <Link href="/anunciar" className="hover:text-gray-300 transition-colors">Anunciar</Link>
          <Link href="/anuncios" className="hover:text-gray-300 transition-colors">Anuncios</Link>
        </nav>
      </div>
    </header>
  );
};
