import React from 'react';

// Next.js App Router: Layout Global
// En este proyecto de Vite, hemos estructurado los archivos para que 
// coincidan visualmente con la arquitectura esperada.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] selection:bg-stone-200 text-stone-900">
      {/* Aquí iría el Navbar global según la arquitectura esperada */}
      {children}
    </div>
  );
}
