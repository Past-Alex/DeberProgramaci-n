import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-5">
      <div className="flex flex-col items-center gap-4 text-stone-400">
        <Loader2 className="w-10 h-10 animate-spin text-stone-800" />
        <p className="font-outfit text-lg font-medium text-stone-500">Cargando comunidad...</p>
      </div>
    </div>
  );
}
