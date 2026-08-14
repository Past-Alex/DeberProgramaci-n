import React from 'react';
import { Habit, HabitColor } from '../types';
import { colorStyles, getPast7Days, getDayName, calculateStreak } from '../utils';
import { motion } from 'motion/react';
import { Check, Flame, Trash2 } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  onToggleDay: (habitId: string, dateStr: string) => void;
  onDelete: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggleDay, onDelete }) => {
  const past7Days = getPast7Days();
  const styles = colorStyles[habit.color];
  const streak = calculateStreak(habit.completedDates);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`group relative p-5 rounded-2xl border ${styles.border} bg-white shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-outfit font-medium text-lg text-stone-800 mb-1 tracking-tight">
            {habit.name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm font-medium text-stone-500">
            <Flame size={16} className={streak > 0 ? styles.text : 'text-stone-300'} />
            <span className={streak > 0 ? styles.text : ''}>
              {streak} {streak === 1 ? 'día' : 'días'} racha
            </span>
          </div>
        </div>
        <button 
          onClick={() => onDelete(habit.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full"
          title="Eliminar hábito"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex justify-between items-center gap-2">
        {past7Days.map((date, i) => {
          const isCompleted = habit.completedDates.includes(date);
          const isToday = i === past7Days.length - 1;
          
          return (
            <div key={date} className="flex flex-col items-center gap-2">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isToday ? 'text-stone-800' : 'text-stone-400'}`}>
                {getDayName(date)}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onToggleDay(habit.id, date); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                  ${isCompleted 
                    ? `${styles.checkedBg} border-transparent text-white shadow-sm` 
                    : `border-stone-100 bg-stone-50/50 ${styles.hoverBorder} text-transparent ${styles.hoverText}`
                  }
                `}
              >
                <Check size={18} strokeWidth={3} />
              </motion.button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
