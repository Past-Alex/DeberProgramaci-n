import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitColor } from '../types';
import { createClient } from '@/utils/supabase/client';

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchHabits = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);
      
    if (habitsData) {
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('habit_id, completed_date');
        
      const formattedHabits: Habit[] = habitsData.map(h => ({
        id: h.id,
        name: h.name,
        color: h.color as HabitColor,
        createdAt: h.created_at,
        completedDates: logsData?.filter(l => l.habit_id === h.id).map(l => l.completed_date) || []
      }));
      
      setHabits(formattedHabits);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = (data: any) => {
    if (data) {
      const newHabit: Habit = {
        id: data.id,
        name: data.name,
        color: data.color as HabitColor,
        completedDates: [],
        createdAt: data.created_at,
      };
      setHabits(prev => [...prev, newHabit]);
    }
  };

  const updateHabitLocally = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const toggleHabitDay = async (habitId: string, dateStr: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(dateStr);
    
    if (isCompleted) {
      // Optimistic update
      setHabits(prev => prev.map(h => 
        h.id === habitId 
          ? { ...h, completedDates: h.completedDates.filter(d => d !== dateStr) }
          : h
      ));
      
      await supabase
        .from('habit_logs')
        .delete()
        .match({ habit_id: habitId, completed_date: dateStr });
    } else {
      // Optimistic update
      setHabits(prev => prev.map(h => 
        h.id === habitId 
          ? { ...h, completedDates: [...h.completedDates, dateStr] }
          : h
      ));
      
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, completed_date: dateStr });
    }
  };

  const deleteHabit = async (habitId: string) => {
    // Calling the server action from UI might still be done outside, but we clean the local state here.
    // However, if we do it here, we import the server action directly. Let's just update local state,
    // assuming the caller executes the DB deletion action.
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  return {
    habits,
    isLoading,
    addHabit,
    updateHabitLocally,
    toggleHabitDay,
    deleteHabit
  };
}
