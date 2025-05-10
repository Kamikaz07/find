import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MapPin, Zap, Users, Bell, FileText, Search, HeartHandshake } from 'lucide-react'; // Added more icons

const IndexPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section - Refined */}
        <section className="relative text-center py-28 md:py-40 bg-[#339999] text-white overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Une os que precisam aos que querem ajudar
            </h1>
            <p className="text-lg md:text-2xl mb-6 max-w-3xl mx-auto">
              FIND: A plataforma digital que centraliza e potencia a solidariedade local em Portugal.
            </p>
            {/* Optional: Placeholder for stats */}
            {/* <p className="text-md md:text-lg mb-8 text-teal-100">Já conectámos X pedidos a Y voluntários!</p> */}
            <div className="space-y-4 md:space-y-0 md:space-x-4">
              <Link
                href="/anunciar"
                className="inline-block px-8 py-3 bg-white text-teal-700 font-semibold rounded-md shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1"
              >
                Publicar Pedido de Ajuda
              </Link>
              <Link
                href="/anuncios"
                className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-md shadow-md hover:bg-white hover:text-teal-700 transition duration-300 transform hover:-translate-y-1"
              >
                Ver Campanhas Ativas
              </Link>
            </div>
          </div>
        </section>

        {/* About Section - Expanded */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-6">A Missão da FIND</h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              A FIND nasceu da necessidade de um espaço centralizado para iniciativas solidárias locais. A nossa missão é simplificar a conexão entre quem precisa de apoio (pessoas ou instituições) e quem deseja oferecer ajuda (voluntários ou doadores). Focamo-nos em ações concretas e de proximidade, desde campanhas de alimentos a recolha de bens, promovendo a transparência e facilitando o impacto direto na comunidade.
            </p>
          </div>
        </section>

        {/* How it Works Section - New */}
        <section className="py-16 md:py-24 bg-teal-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-800 text-center mb-12">Como Funciona</h2>
            <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="text-center">
                <FileText className="w-16 h-16 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-teal-800 mb-2">1. Publique ou Encontre</h3>
                <p className="text-gray-600">Instituições e indivíduos podem publicar pedidos de ajuda detalhados. Voluntários e doadores pesquisam por localização ou categoria.</p>
              </div>
              {/* Step 2 */}
              <div className="text-center">
                <Search className="w-16 h-16 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-teal-800 mb-2">2. Conecte-se</h3>
                <p className="text-gray-600">Utilize a plataforma para encontrar campanhas relevantes perto de si e entre em contacto direto através de mensagens internas (brevemente).</p>
              </div>
              {/* Step 3 */}
              <div className="text-center">
                <HeartHandshake className="w-16 h-16 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-teal-800 mb-2">3. Faça a Diferença</h3>
                <p className="text-gray-600">Contribua com o seu tempo, bens ou doações. Acompanhe o progresso e o impacto das suas ações através do seu perfil.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Refined */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-800 text-center mb-12">Funcionalidades Chave</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-50 rounded-lg shadow-md p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <MapPin className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-teal-800 mb-2">Anúncios Geolocalizados</h3>
                <p className="text-gray-600">Visualize e filtre pedidos de ajuda por proximidade geográfica.</p>
              </div>
              <div className="bg-gray-50 rounded-lg shadow-md p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <Zap className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-teal-800 mb-2">Promoção de Campanhas</h3>
                <p className="text-gray-600">Destaque anúncios urgentes para maior visibilidade através de uma taxa simbólica.</p>
              </div>
              <div className="bg-gray-50 rounded-lg shadow-md p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <Users className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-teal-800 mb-2">Perfis Dedicados</h3>
                <p className="text-gray-600">Gestão simplificada de anúncios, histórico e dados para utilizadores e organizações.</p>
              </div>
              <div className="bg-gray-50 rounded-lg shadow-md p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <Bell className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-teal-800 mb-2">Notificações Relevantes</h3>
                <p className="text-gray-600">Alertas em tempo real sobre novas campanhas ou atualizações na sua área.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Campaign Highlights Section - Added Link */}
        <section className="py-16 md:py-24 bg-teal-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-800 text-center mb-12">Campanhas em Destaque</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Example Campaign Cards - Keep structure */}
              <div className="rounded-lg shadow-lg overflow-hidden group bg-white">
                <Image src="/produto1.jpg" alt="Campanha 1" width={400} height={250} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-teal-800 mb-2">Recolha de Alimentos</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">Apoie famílias locais com bens essenciais para o dia-a-dia.</p>
                  <Link href="/anuncios" className="text-teal-600 hover:underline font-medium">Ver Detalhes</Link>
                </div>
              </div>
              <div className="rounded-lg shadow-lg overflow-hidden group bg-white">
                 <Image src="/produto2.jpg" alt="Campanha 2" width={400} height={250} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                 <div className="p-6">
                   <h3 className="text-xl font-semibold text-teal-800 mb-2">Material Escolar</h3>
                   <p className="text-gray-600 mb-4 line-clamp-2">Ajude crianças carenciadas a terem um bom início de ano letivo com o material necessário.</p>
                   <Link href="/anuncios" className="text-teal-600 hover:underline font-medium">Ver Detalhes</Link>
                 </div>
               </div>
               <div className="rounded-lg shadow-lg overflow-hidden group bg-white">
                 <Image src="/produto3.jpg" alt="Campanha 3" width={400} height={250} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                 <div className="p-6">
                   <h3 className="text-xl font-semibold text-teal-800 mb-2">Apoio a Idosos</h3>
                   <p className="text-gray-600 mb-4 line-clamp-2">Ofereça companhia, auxílio em tarefas diárias ou pequenas reparações a idosos isolados.</p>
                   <Link href="/anuncios" className="text-teal-600 hover:underline font-medium">Ver Detalhes</Link>
                 </div>
               </div>
            </div>
            <div className="text-center mt-12">
              <Link
                href="/anuncios"
                className="inline-block px-6 py-3 bg-teal-600 text-white font-semibold rounded-md shadow-md hover:bg-teal-700 transition duration-300"
              >
                Ver Todas as Campanhas
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Kept similar */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-800 text-center mb-12">Histórias de Impacto</h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-lg shadow-md p-8 border border-gray-200">
                <p className="text-gray-700 italic mb-4">&quot;A FIND foi fundamental para mobilizar apoio para a nossa associação. A facilidade de uso e a visibilidade local fizeram toda a diferença.&quot;</p>
                <p className="font-semibold text-teal-700">- Carla M., Coordenadora de Projeto Social</p>
              </div>
              <div className="bg-gray-50 rounded-lg shadow-md p-8 border border-gray-200">
                <p className="text-gray-700 italic mb-4">&quot;Como voluntário, aprecio poder encontrar rapidamente onde a minha ajuda é mais necessária na minha cidade. Recomendo vivamente!&quot;</p>
                <p className="font-semibold text-teal-700">- Ricardo T., Voluntário</p>
              </div>
            </div>
          </div>
        </section>

        {/* Partnerships Section - Refined */}
        <section className="py-16 md:py-24 bg-teal-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-6">Parcerias Institucionais e Apoios</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-12">
              Colaboramos com ONGs, empresas e entidades locais para maximizar o nosso impacto. Juntos, fortalecemos a rede de solidariedade.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-70">
              {/* Replace with actual logos when available */}
              <span className="text-gray-600 text-lg font-medium">Nome ONG Parceira</span>
              <span className="text-gray-600 text-lg font-medium">Empresa Apoiante</span>
              <span className="text-gray-600 text-lg font-medium">Entidade Local</span>
              <span className="text-gray-600 text-lg font-medium">Outra ONG</span>
            </div>
            <div className="mt-12">
               <Link
                 href="/parcerias" // Placeholder link for partnership page
                 className="text-teal-700 hover:underline font-medium"
               >
                 Interessado em ser nosso parceiro? Saiba mais aqui.
               </Link>
             </div>
          </div>
        </section>

        {/* Final CTA Section - New */}
        <section className="py-16 md:py-24 bg-[#339999] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para Fazer a Diferença?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
              Quer precise de ajuda ou deseje contribuir, a FIND é o seu ponto de partida. Junte-se à nossa comunidade solidária hoje mesmo.
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-4">
              <Link
                href="/anunciar"
                className="inline-block px-8 py-3 bg-white text-teal-700 font-semibold rounded-md shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1"
              >
                Preciso de Ajuda
              </Link>
              <Link
                href="/anuncios"
                className="inline-block px-8 py-3 bg-teal-100 text-teal-800 font-semibold rounded-md shadow-lg hover:bg-teal-200 transition duration-300 transform hover:-translate-y-1"
              >
                Quero Ajudar
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default IndexPage;
