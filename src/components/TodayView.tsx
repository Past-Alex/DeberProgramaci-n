import React from 'react';
import { Habit } from '../types';
import { colorStyles, getToday, calculateStreak } from '../utils';
import { motion } from 'motion/react';
import { Check, Flame, Trophy } from 'lucide-react';

interface TodayViewProps {
  habits: Habit[];
  onToggleDay: (habitId: string, dateStr: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ habits, onToggleDay }) => {
  const todayStr = getToday();
  const completedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const total = habits.length;
  const progress = total === 0 ? 0 : (completedToday / total) * 100;

  return (
    <div className="space-y-8">
      {/* Daily Motivation / Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-stone-50 rounded-3xl p-6 md:p-8 border border-stone-200"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-playfair text-2xl text-stone-800 mb-2">
              {completedToday === total && total > 0 
                ? '¡Día perfecto!' 
                : 'Progreso de hoy'}
            </h2>
            <p className="font-outfit text-stone-500">
              Has completado {completedToday} de {total} hábitos.
            </p>
          </div>
          
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-stone-200"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-stone-800 transition-all duration-1000 ease-out"
                strokeDasharray={`${progress}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-outfit font-medium text-stone-700">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* Focus List */}
      <div className="space-y-3">
        <h3 className="font-outfit font-medium text-stone-400 uppercase tracking-widest text-xs mb-4 ml-1">
          Lista de Enfoque
        </h3>
        
        {habits.length === 0 ? (
          <div className="text-center py-12 text-stone-400 font-outfit">
            No tienes hábitos. Empieza añadiendo uno.
          </div>
        ) : (
          <div className="grid gap-3">
            {habits.map((habit, i) => {
              const isCompleted = habit.completedDates.includes(todayStr);
              const styles = colorStyles[habit.color] || colorStyles.stone;
              const streak = calculateStreak(habit.completedDates);
              
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`
                    group relative p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer
                    ${isCompleted ? 'bg-stone-50 border-stone-100' : `bg-white ${styles.border} hover:shadow-sm`}
                  `}
                  onClick={(e) => { e.stopPropagation(); onToggleDay(habit.id, todayStr); }}
                >
                  <div className="flex items-center gap-4">
                    <button
                      className={`
                        w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all
                        ${isCompleted 
                          ? `${styles.checkedBg} border-transparent text-white scale-110 shadow-sm` 
                          : `${styles.border} text-transparent ${styles.hoverBorder}`
                        }
                      `}
                      onClick={(e) => { e.stopPropagation(); onToggleDay(habit.id, todayStr); }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                    <div>
                      <h4 className={`font-outfit font-medium text-lg transition-colors ${isCompleted ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                        {habit.name}
                      </h4>
                    </div>
                  </div>
                  
                  {streak > 0 && (
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${styles.bg} ${styles.text}`}>
                      <Flame size={12} />
                      {streak}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
