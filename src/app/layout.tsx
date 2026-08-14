import React from 'react';
import '../index.css';

export const metadata = {
  title: 'Rastreador de Hábitos',
  description: 'Aplicación para rastrear tus hábitos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#FDFCF8] selection:bg-stone-200 text-stone-900">
        {children}
      </body>
    </html>
  );
}
