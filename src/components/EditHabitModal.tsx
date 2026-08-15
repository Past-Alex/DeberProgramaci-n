import React, { useState, useEffect } from 'react';
import { Habit, HabitColor } from '../types';
import { colorStyles } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { updateHabit } from '../app/actions';

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  onUpdate: (habit: any) => void;
}

const colors: HabitColor[] = ['rose', 'amber', 'emerald', 'sky', 'violet', 'stone'];

export const EditHabitModal: React.FC<EditHabitModalProps> = ({ isOpen, onClose, habit, onUpdate }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<HabitColor>('rose');

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setSelectedColor(habit.color);
    }
  }, [habit]);

  const handleAction = async (formData: FormData) => {
    if (!habit) return;
    formData.append('id', habit.id);
    formData.append('color', selectedColor);
    try {
      await updateHabit(formData);
      onUpdate({ ...habit, name, color: selectedColor });
      onClose();
    } catch (e) {
      console.error(e);
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
            onClick={onClose}
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
                  Editar Hábito
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form action={handleAction} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-2 font-outfit">
                    Nombre del hábito
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Leer 20 páginas, Meditar..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-transparent transition-all font-outfit"
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
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform
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
                    disabled={!name.trim()}
                    className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors font-outfit flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    <span>Guardar cambios</span>
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
