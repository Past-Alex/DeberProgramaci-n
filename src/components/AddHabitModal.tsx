import React, { useState } from 'react';
import { HabitColor } from '../types';
import { colorStyles } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { createHabit } from '../app/actions';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: any) => void;
}

const colors: HabitColor[] = ['rose', 'amber', 'emerald', 'sky', 'violet', 'stone'];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<HabitColor>('rose');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (formData: FormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    formData.append('color', selectedColor);
    try {
      const newHabit = await createHabit(formData);
      onAdd(newHabit); // We will update onAdd signature in App.tsx to accept the full habit object
      setName('');
      setSelectedColor('rose');
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-playfair text-2xl font-semibold text-stone-800">
                  Nuevo Hábito
                </h2>
                <button 
                  onClick={!isSubmitting ? onClose : undefined}
                  disabled={isSubmitting}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form action={handleAction} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-2 font-outfit">
                    ¿Qué quieres lograr?
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Ej. Leer 20 páginas, Meditar..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-transparent transition-all font-outfit disabled:opacity-50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-3 font-outfit">
                    Color estético
                  </label>
                  <div className="flex gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform disabled:opacity-50
                          ${colorStyles[color].checkedBg}
                          ${selectedColor === color ? 'ring-4 ring-offset-2 ring-stone-200 scale-110 shadow-sm' : 'hover:scale-110 opacity-80'}
                        `}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!name.trim() || isSubmitting}
                    className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors font-outfit flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>Crear hábito</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
