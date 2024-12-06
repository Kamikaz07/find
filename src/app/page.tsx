import React from 'react';
import Image from 'next/image';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const IndexPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#E0F4F4]">
      {/* Header */}
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16 bg-white rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <Image src="/logo.jpg" alt="Logo FIND" width={128} height={128} className="mx-auto" />
              <h1 className="text-5xl font-bold text-teal-800 mt-4">Bem-vindo ao FIND</h1>
              <p className="text-xl text-teal-700 mt-6">
                Conectamos pessoas e organizações que necessitam de ajuda com quem deseja apoiar. Junte-se a nós para fazer a diferença.
              </p>
              <a
                href="/anuncios"
                className="mt-6 inline-block px-8 py-4 bg-teal-600 text-white font-semibold rounded-md shadow-md hover:bg-teal-700 transition"
              >
                Veja os nossos anúncios
              </a>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <Image src="/smiling_guys.jpg" alt="Ajuda Comunitária" width={600} height={400} className="rounded-md" style={{ marginLeft: '15px' }} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-16">
          <h2 className="text-4xl font-bold text-teal-800 text-center mb-12">Explore os Benefícios do FIND</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-2xl font-semibold text-teal-800">Dados e Audiências</h3>
              <p className="text-teal-700 mt-4">
                Entenda as necessidades da comunidade através dos diversos anúncios para conseguir ajudar quem mais precisa.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-2xl font-semibold text-teal-800">Usabilidade de Grande Escala</h3>
              <p className="text-teal-700 mt-4">
                Oferecemos uma plataforma fácil e prática de usar para qualquer um conseguir ajuda.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-2xl font-semibold text-teal-800">Engajamento Social</h3>
              <p className="text-teal-700 mt-4">
                Facilitamos o envolvimento da comunidade, conectando doadores a que mprecisam de apoio.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 mt-16 bg-teal-700 text-white rounded-lg">
          <h2 className="text-4xl font-bold">Não sabe como ajudar?</h2>
          <p className="text-xl mt-4">
            Podemos ajudá-lo a ajudar com apenas alguns cliques.
          </p>
          <a
            href="/anuncios"
            className="mt-6 inline-block px-8 py-4 bg-white text-teal-700 font-semibold rounded-md shadow-md hover:bg-gray-200 transition"
          >
            Encontre anúncios
          </a>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default IndexPage;
