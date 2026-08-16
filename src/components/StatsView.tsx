import React from 'react';
import { Habit } from '../types';
import { getCompletionData, getBestHabit, getTotalCompletions } from '../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import { Trophy, Activity, Target } from 'lucide-react';

interface StatsViewProps {
  habits: Habit[];
}

export const StatsView: React.FC<StatsViewProps> = ({ habits }) => {
  const chartData = getCompletionData(habits, 14); // Last 14 days
  const { habit: bestHabit, streak: bestStreak } = getBestHabit(habits);
  const totalCompletions = getTotalCompletions(habits);

  const activeHabitsCount = habits.length;
  
  if (habits.length === 0) {
    return (
      <div className="text-center py-20 text-stone-400 font-outfit">
        Añade hábitos y complétalos para ver tus estadísticas.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-50 rounded-3xl p-6 border border-stone-100 flex flex-col items-center justify-center text-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-1">
            <Trophy size={20} />
          </div>
          <p className="font-outfit text-stone-500 text-sm">Hábito más fuerte</p>
          <h4 className="font-playfair text-xl text-stone-800">
            {bestHabit ? bestHabit.name : '-'}
          </h4>
          <p className="font-outfit text-orange-600 text-xs font-medium bg-orange-100/50 px-2 py-0.5 rounded-full">
            {bestStreak} días seguidos
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-stone-50 rounded-3xl p-6 border border-stone-100 flex flex-col items-center justify-center text-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
            <Target size={20} />
          </div>
          <p className="font-outfit text-stone-500 text-sm">Total completados</p>
          <h4 className="font-playfair text-3xl text-stone-800">
            {totalCompletions}
          </h4>
          <p className="font-outfit text-stone-400 text-xs">veces</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-stone-50 rounded-3xl p-6 border border-stone-100 flex flex-col items-center justify-center text-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
            <Activity size={20} />
          </div>
          <p className="font-outfit text-stone-500 text-sm">Hábitos activos</p>
          <h4 className="font-playfair text-3xl text-stone-800">
            {activeHabitsCount}
          </h4>
          <p className="font-outfit text-stone-400 text-xs">en seguimiento</p>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm"
      >
        <div className="mb-8">
          <h3 className="font-playfair text-xl text-stone-800 mb-1">Tendencia de 14 días</h3>
          <p className="font-outfit text-stone-500 text-sm">Porcentaje de completitud diaria</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <YAxis hide type="number" domain={[0, 100]} />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a8a29e', fontSize: 12, fontFamily: 'Outfit' }}
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: '#f5f5f4' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid #e7e5e4',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontFamily: 'Outfit'
                }}
                formatter={(value: any) => [`${Math.round(value)}%`, 'Completado']}
                labelStyle={{ color: '#78716c', fontWeight: 500, marginBottom: '4px' }}
              />
              <Bar 
                dataKey="percentage" 
                radius={[6, 6, 6, 6]}
                maxBarSize={40}
                activeBar={false}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.percentage === 100 ? '#292524' : '#d6d3d1'} 
                    className="transition-all duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};
