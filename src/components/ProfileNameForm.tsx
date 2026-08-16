'use client';

import React, { useState } from 'react';
import { updateProfileName } from '../app/actions';
import { Edit2, Check, X, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileNameFormProps {
  initialName: string;
}

export const ProfileNameForm: React.FC<ProfileNameFormProps> = ({ initialName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName || 'Usuario');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || name === initialName) {
      setIsEditing(false);
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    
    try {
      await updateProfileName(formData);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      // fallback on error
      setName(initialName);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-stone-500 mb-2 font-outfit flex items-center gap-2">
        <UserCircle size={16} /> Nombre
      </label>
      
      {!isEditing ? (
        <div className="flex items-center justify-between px-4 py-3 bg-stone-50 rounded-xl border border-stone-100 group">
          <div className="font-outfit text-stone-800 text-lg">
            {name}
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-200/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Editar nombre"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            autoFocus
            className="flex-1 font-outfit text-stone-800 text-lg px-4 py-2.5 bg-white rounded-xl border-2 border-stone-200 focus:outline-none focus:border-stone-400 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={isSubmitting || name.trim() === ''}
            className="p-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center justify-center shadow-sm"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Check size={20} />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setName(initialName);
              setIsEditing(false);
            }}
            disabled={isSubmitting}
            className="p-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </form>
      )}
    </div>
  );
};
