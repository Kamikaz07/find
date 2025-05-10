import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin } from 'lucide-react'; // Example social icons

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#B2E4E4] py-8 md:py-12 text-gray-700"> {/* Slightly darker teal and more padding */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-teal-800 mb-3">Contacto</h3>
            <p>Email: <a href="mailto:geral@findigiveit.com" className="hover:text-teal-600">geral@findigiveit.com</a></p>
            {/* Add more contact info if available */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-teal-800 mb-3">Links Úteis</h3>
            <ul className="space-y-2">
              <li><Link href="/sobre" className="hover:text-teal-600">Sobre Nós</Link></li>
              <li><Link href="/anuncios" className="hover:text-teal-600">Ver Campanhas</Link></li>
              <li><Link href="/faq" className="hover:text-teal-600">FAQ</Link></li> {/* Example Link */}
            </ul>
          </div>

          {/* Social Media & Legal */}
          <div>
            <h3 className="text-lg font-semibold text-teal-800 mb-3">Siga-nos</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-teal-700"><Facebook size={24} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-teal-700"><Instagram size={24} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-teal-700"><Linkedin size={24} /></a>
            </div>
            <ul className="space-y-1 text-sm">
               <li><Link href="/termos" className="hover:text-teal-600">Termos de Uso</Link></li> {/* Placeholder Link */}
               <li><Link href="/privacidade" className="hover:text-teal-600">Política de Privacidade</Link></li> {/* Placeholder Link */}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-teal-300 pt-6 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} FIND (findigiveit.com). Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
