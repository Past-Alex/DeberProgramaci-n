import React, { useState } from 'react';
import { Role, User } from '../../../types';
import { motion } from 'motion/react';
import { UserCircle, GraduationCap, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginViewProps) {
  const [name, setName] = useState('');

  const [role, setRole] = useState<Role | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && role) {
      onLogin({
        id: crypto.randomUUID(),
        name: name.trim(),
        role: role
      });
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
          <h1 className="font-playfair text-3xl font-semibold text-stone-800 mb-2">Bienvenido</h1>
          <p className="font-outfit text-stone-500">Por favor, identifícate para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-2 font-outfit">
              Tu Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Ana García"
              className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-transparent transition-all font-outfit"
              required
            />
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
            disabled={!name.trim() || !role}
            className="w-full py-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors font-outfit flex items-center justify-center gap-2"
          >
            <span>Ingresar</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
