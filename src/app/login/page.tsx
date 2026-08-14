"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (email.trim() && password.trim()) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
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
        <div className="text-center mb-10">
          <h1 className="font-playfair text-3xl font-semibold text-stone-800 mb-2">Bienvenido de nuevo</h1>
          <p className="font-outfit text-stone-500">Ingresa tus credenciales para continuar.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-outfit text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!email.trim() || !password.trim() || loading}
            className="w-full py-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors font-outfit flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Iniciando sesión...' : 'Ingresar'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center font-outfit text-stone-500 text-sm">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-stone-900 font-medium hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
