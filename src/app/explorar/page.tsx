import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { colorStyles } from '@/utils';
import { HabitColor } from '@/types';

import { createClient } from '@/utils/supabase/server';
import { createHabit } from '@/app/actions';
import { redirect } from 'next/navigation';

const PUBLIC_TEMPLATES = [
  { id: 't1', name: 'Leer 10 páginas', color: 'blue' as HabitColor, desc: 'Expande tu conocimiento diariamente.' },
  { id: 't2', name: 'Meditar 5 min', color: 'purple' as HabitColor, desc: 'Encuentra paz y claridad mental.' },
  { id: 't3', name: 'Tomar 2L de agua', color: 'cyan' as HabitColor, desc: 'Mantén tu cuerpo hidratado.' },
  { id: 't4', name: 'Hacer ejercicio', color: 'rose' as HabitColor, desc: 'Fortalece tu cuerpo y mente.' },
];

export default async function ExplorarPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: publicHabits } = await supabase
    .from('habits')
    .select('id, name, color, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  const displayHabits = publicHabits && publicHabits.length > 0 
    ? publicHabits.map(h => ({ ...h, desc: 'Un hábito creado por la comunidad.' })) 
    : PUBLIC_TEMPLATES;

  const handleAdopt = async (formData: FormData) => {
    'use server';
    await createHabit(formData);
    redirect('/dashboard?success=1');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] p-5">
      <div className="max-w-4xl mx-auto pt-10">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-8 font-outfit transition-colors">
          <ArrowLeft size={18} />
          <span>Volver al inicio</span>
        </Link>

        <div className="mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-semibold text-stone-800 mb-4">
            Explorar Hábitos
          </h1>
          <p className="font-outfit text-stone-500 text-lg">
            Descubre los últimos hábitos compartidos por la comunidad e inspírate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayHabits.map((item) => {
            const styles = colorStyles[item.color as HabitColor] || colorStyles.stone;
            return (
              <div key={item.id} className={`p-6 rounded-2xl border ${styles.border} bg-white shadow-sm flex flex-col`}>
                <div className={`w-12 h-12 rounded-full ${styles.bg} ${styles.text} flex items-center justify-center mb-4`}>
                  <Sparkles size={24} />
                </div>
                <h3 className="font-outfit font-medium text-xl text-stone-800 mb-2">{item.name}</h3>
                <p className="font-outfit text-stone-500 mb-6 flex-grow">{item.desc}</p>
                
                {user ? (
                  <form action={handleAdopt}>
                    <input type="hidden" name="name" value={item.name} />
                    <input type="hidden" name="color" value={item.color} />
                    <button type="submit" className={`inline-flex items-center justify-center px-4 py-2 rounded-xl font-outfit font-medium ${styles.bg} ${styles.text} hover:opacity-90 transition-opacity self-start`}>
                      Añadir a mi lista
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className={`inline-flex items-center justify-center px-4 py-2 rounded-xl font-outfit font-medium ${styles.bg} ${styles.text} hover:opacity-90 transition-opacity self-start`}>
                    Inicia sesión para añadir
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
