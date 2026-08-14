"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserCircle, GraduationCap, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Role } from '@/types';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Por favor, selecciona un rol.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    if (email.trim() && password.trim() && name.trim()) {
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
            role: role
          }
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Automatically redirects or shows success (depends on email confirmation config)
        // If email confirmation is off, user is logged in
        router.push('/dashboard');
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-5 selection:bg-stone-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-stone-200 p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl font-semibold text-stone-800 mb-2">Crear Cuenta</h1>
          <p className="font-outfit text-stone-500">Únete a nuestra comunidad de hábitos.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-outfit text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-2 font-outfit">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Ana García"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-transparent transition-all font-outfit"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-600 mb-2 font-outfit">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-transparent transition-all font-outfit"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-600 mb-2 font-outfit">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-transparent transition-all font-outfit"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-3 font-outfit">
              Selecciona tu rol
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                  role === 'user' 
                    ? 'border-stone-800 bg-stone-50 text-stone-900' 
                    : 'border-stone-100 bg-white text-stone-400 hover:border-stone-200 hover:text-stone-600'
                }`}
              >
                <UserCircle size={28} />
                <span className="font-outfit font-medium">Alumno / Usuario</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('coach')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                  role === 'coach' 
                    ? 'border-stone-800 bg-stone-50 text-stone-900' 
                    : 'border-stone-100 bg-white text-stone-400 hover:border-stone-200 hover:text-stone-600'
                }`}
              >
                <GraduationCap size={28} />
                <span className="font-outfit font-medium">Coach / Guía</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !email.trim() || !password.trim() || !role || loading}
            className="w-full py-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors font-outfit flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Registrando...' : 'Registrarse'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center font-outfit text-stone-500 text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-stone-900 font-medium hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
