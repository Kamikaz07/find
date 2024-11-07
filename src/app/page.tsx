import React from 'react';
import Image from 'next/image';

const IndexPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#40B3B3]">
      <header className="text-center py-10">
        <Image src="/logo.jpg" alt="Logo FIND" width={128} height={128} className="mx-auto" />
        <h1 className="text-4xl font-bold text-white mt-4">Bem-vindo ao FIND</h1>
        <p className="text-lg text-white mt-2">
          Encontre ajuda ou ofereça suporte a quem precisa.
        </p>
      </header>
      <main className="flex flex-col items-center mt-8">
        <a
          href="/anuncios"
          className="px-6 py-3 bg-white text-teal-500 font-semibold rounded-md shadow-md hover:bg-gray-200 transition"
        >
          Ver Anúncios
        </a>
        <a
          href="/anunciar"
          className="mt-4 px-6 py-3 bg-white text-teal-500 font-semibold rounded-md shadow-md hover:bg-gray-200 transition"
        >
          Criar Anúncio
        </a>
      </main>
    </div>
  );
};

export default IndexPage;
