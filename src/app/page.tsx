import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center p-5 selection:bg-stone-200">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-600 mb-8 font-outfit text-sm">
          <Sparkles size={16} />
          <span>Tu nuevo rastreador de hábitos</span>
        </div>
        
        <h1 className="font-playfair text-5xl md:text-7xl font-semibold text-stone-800 mb-6 leading-tight">
          Construye la vida que deseas, un día a la vez.
        </h1>
        
        <p className="font-outfit text-stone-500 text-lg md:text-xl mb-10">
          Lleva un registro de tus hábitos, alcanza tus metas y descubre un nuevo nivel de bienestar con nuestra plataforma.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="px-8 py-4 bg-stone-900 text-white rounded-xl font-outfit font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
            <span>Comenzar ahora</span>
            <ArrowRight size={18} />
          </Link>
          <Link href="/explorar" className="px-8 py-4 bg-white border border-stone-200 text-stone-700 rounded-xl font-outfit font-medium hover:bg-stone-50 transition-colors">
            Explorar plantillas
          </Link>
          <Link href="/login" className="px-8 py-4 text-stone-500 font-outfit font-medium hover:text-stone-800 transition-colors flex items-center justify-center">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
