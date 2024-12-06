import React from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

const SobrePage = () => {
  const teamMembers = [
    { name: "Afonso Brito", description: "Programador" },
    { name: "Beatriz Gaspar", description: "Designer" },
    { name: "Liliana Dias", description: "Gestora de Projetos" },
    { name: "Melina Rodrigues", description: "Responsável pelo Marketing Digital" },
    { name: "Rodrigo Fonseca", description: "Programador Full-Stack" },
  ];

  return (
    <>
      <Header />
      <div className="bg-[#F4F9F9] min-h-screen">
        <div className="container mx-auto py-16 px-4">
          {/* Logo e Bem-vindo na mesma caixa */}
          <div className="flex flex-col md:flex-row items-center bg-[#EAF7F7] shadow-md rounded-lg p-8 mb-16">
            <img
              src="logo.jpg"
              alt="Logótipo FIND"
              className="w-32 h-32 mx-auto md:mx-0 md:mr-8"
            />
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-[#333333] mb-4">Bem-vindo ao FIND</h1>
              <p className="text-lg text-[#555555]">
                Somos uma ONG dedicada a conectar pessoas e organizações que necessitam de ajuda com aqueles dispostos a ajudar. Acreditamos no poder da solidariedade para transformar vidas e comunidades.
              </p>
            </div>
          </div>

          {/* Missão e Funcionamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="text-center bg-[#339999] shadow-md rounded-lg p-8 text-white flex flex-col items-center">
              <img
                src="dar.jpg"
                alt="Missão"
                className="w-56 h-56 object-cover mb-4"
              />
              <h2 className="text-2xl font-semibold mb-4">A Nossa Missão</h2>
              <p>
                Pretendemos facilitar conexões entre pessoas que precisam de apoio e aqueles que desejam fazer a diferença, criando uma comunidade internacional colaborativa e solidária.
              </p>
              <p className="text-sm mt-2">Imagem que representa a nossa missão.</p>
            </div>
            <div className="text-center bg-[#339999] shadow-md rounded-lg p-8 text-white flex flex-col items-center">
              <img
                src="exemplo.jpg"
                alt="Funcionamento"
                className="w-90 h-56 object-cover mb-4"
              />
              <h2 className="text-2xl font-semibold mb-4">Como Funciona</h2>
              <p>
                A nossa plataforma permite que utilizadores publiquem anúncios com a ajuda que precisam, conectando diretamente quem precisa com quem pode oferecer apoio através de entregas de bens ou de exposição por prioridades.
              </p>
              <p className="text-sm mt-2">Exemplo de um anúncio.</p>
            </div>
          </div>

          {/* Equipa */}
          <div className="bg-white shadow-md rounded-lg p-8 text-center mb-16">
            <h2 className="text-3xl font-bold text-[#333333] mb-6">A Equipa</h2>
            <img
              src="equipa.jpg"
              alt="Foto da equipa"
              className="mx-auto w-96 h-64 mb-4 rounded-lg shadow-lg"
            />
            <p className="text-lg text-[#555555] mb-6">
              Conheça as pessoas que tornam o FIND possível, a equipa que trabalha com dedicação para manter este site disponível para quem precisa de ajuda e para quem quer oferecer apoio.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-[#339999] rounded-lg shadow-md text-white"
                >
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-sm">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SobrePage;
