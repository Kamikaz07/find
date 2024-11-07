import React from 'react';
import { Header } from '../Header/page';
import { Footer } from '../Footer/page';

const SobrePage = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#40B3B3] flex items-center justify-center text-white">
        <div className=" text-center">
          <h1 className="text-3xl font-bold mb-4">Sobre o FIND</h1>
          <p className="text-lg mb-6">
            O FIND é uma plataforma solidária que conecta pessoas necessitadas com aqueles que podem ajudar.
            Acreditamos na colaboração e na solidariedade para tornar o mundo um lugar melhor.
          </p>
          <p className="text-lg">
            Quer contribuir? Crie um anúncio ou explore as necessidades da nossa comunidade para ver como
            você pode ajudar!
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SobrePage;
