import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flame, Calendar, Trophy } from 'lucide-react';
import { colorStyles } from '@/utils';

export default async function HabitoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // No redirigimos si no hay usuario, permitimos que cualquier visitante vea el detalle (Requerimiento 2.5.2)

  // Fetch habit
  const { data: habit, error: habitError } = await supabase
    .from('habits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (habitError || !habit) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] p-5 flex flex-col items-center justify-center text-center">
        <h1 className="font-playfair text-3xl font-semibold text-stone-800 mb-4">Hábito no encontrado</h1>
        <p className="font-outfit text-stone-500 mb-8">No hemos podido encontrar este hábito o no te pertenece.</p>
        <Link href="/dashboard" className="px-6 py-3 bg-stone-900 text-white rounded-xl font-outfit hover:bg-stone-800">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  // Fetch logs for stats
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('completed_date')
    .eq('habit_id', habit.id);

  const totalCompletions = logs?.length || 0;
  const styles = colorStyles[habit.color as keyof typeof colorStyles] || colorStyles.stone;

  return (
    <div className="min-h-screen bg-[#FDFCF8] p-5">
      <div className="max-w-5xl mx-auto pt-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-8 font-outfit transition-colors">
          <ArrowLeft size={18} />
          <span>Volver al Dashboard</span>
        </Link>

        <div className={`bg-white rounded-3xl shadow-sm border ${styles.border} p-8 md:p-10 mb-6`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-16 h-16 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center`}>
              <Flame size={32} />
            </div>
            <div>
              <h1 className="font-playfair text-3xl md:text-4xl font-semibold text-stone-800">{habit.name}</h1>
              <p className="font-outfit text-stone-500 mt-1">
                Creado el {new Date(habit.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-stone-400 shadow-sm">
                <Trophy size={24} />
              </div>
              <div>
                <p className="font-outfit text-sm text-stone-500">Total completados</p>
                <p className="font-outfit font-semibold text-2xl text-stone-800">{totalCompletions} veces</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-stone-400 shadow-sm">
                <Calendar size={24} />
              </div>
              <div>
                <p className="font-outfit text-sm text-stone-500">Color</p>
                <p className="font-outfit font-semibold text-xl text-stone-800 capitalize">{habit.color}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
