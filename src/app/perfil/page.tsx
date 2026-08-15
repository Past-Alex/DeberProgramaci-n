import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserCircle, Mail, Shield } from 'lucide-react';

export default async function PerfilPage() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#FDFCF8] p-5">
      <div className="max-w-2xl mx-auto pt-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-8 font-outfit transition-colors">
          <ArrowLeft size={18} />
          <span>Volver al Dashboard</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 md:p-10">
          <div className="flex items-center gap-6 mb-10 pb-10 border-b border-stone-100">
            <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
              <UserCircle size={48} />
            </div>
            <div>
              <h1 className="font-playfair text-3xl font-semibold text-stone-800 mb-1">Mi Perfil</h1>
              <p className="font-outfit text-stone-500">Gestiona tu información personal.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-500 mb-2 font-outfit flex items-center gap-2">
                <UserCircle size={16} /> Nombre
              </label>
              <div className="font-outfit text-stone-800 text-lg px-4 py-3 bg-stone-50 rounded-xl border border-stone-100">
                {profile?.name || 'Usuario'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-500 mb-2 font-outfit flex items-center gap-2">
                <Mail size={16} /> Correo Electrónico
              </label>
              <div className="font-outfit text-stone-800 text-lg px-4 py-3 bg-stone-50 rounded-xl border border-stone-100">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-500 mb-2 font-outfit flex items-center gap-2">
                <Shield size={16} /> Rol en la plataforma
              </label>
              <div className="font-outfit text-stone-800 text-lg px-4 py-3 bg-stone-50 rounded-xl border border-stone-100 capitalize inline-block">
                {profile?.role === 'coach' ? 'Coach / Guía' : 'Alumno / Usuario'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
