import { Habit, HabitColor, BlogPost } from './types';

// Devuelve una fecha en formato YYYY-MM-DD según la zona horaria local
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getToday(): string {
  return formatDate(new Date());
}

// Obtiene los últimos 7 días terminando hoy
export function getPast7Days(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

// Devuelve el nombre corto del día en español (ej: "Lun")
export function getDayName(dateString: string): string {
  // Añadimos T12:00:00 para evitar problemas de zona horaria al parsear
  const d = new Date(dateString + 'T12:00:00');
  const name = d.toLocaleDateString('es-ES', { weekday: 'short' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Calcula la racha actual (días consecutivos completados hasta hoy o ayer)
export function calculateStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const sortedDates = [...completedDates].sort((a, b) => b.localeCompare(a)); // Descendente
  let streak = 0;
  
  const today = new Date();
  let currentCheckDate = new Date(today);
  
  // Revisamos si hoy está completado
  const todayStr = formatDate(currentCheckDate);
  if (sortedDates.includes(todayStr)) {
    streak++;
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
  } else {
    // Si hoy no está completado, verificamos ayer para ver si la racha sigue viva
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (!sortedDates.includes(formatDate(yesterday))) {
      return 0; // Ni hoy ni ayer están completados, la racha es 0
    }
    currentCheckDate = yesterday;
  }

  // Contamos días anteriores
  while (true) {
    const dateStr = formatDate(currentCheckDate);
    if (sortedDates.includes(dateStr)) {
      if (dateStr !== todayStr) { // Ya contamos hoy arriba si estaba
        streak++;
      }
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export const colorStyles: Record<HabitColor, { bg: string; text: string; border: string; checkedBg: string; hoverBorder: string; hoverText: string }> = {
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', checkedBg: 'bg-rose-400', hoverBorder: 'hover:border-rose-300', hoverText: 'hover:text-rose-400' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', checkedBg: 'bg-amber-400', hoverBorder: 'hover:border-amber-300', hoverText: 'hover:text-amber-400' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', checkedBg: 'bg-emerald-400', hoverBorder: 'hover:border-emerald-300', hoverText: 'hover:text-emerald-400' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', checkedBg: 'bg-sky-400', hoverBorder: 'hover:border-sky-300', hoverText: 'hover:text-sky-400' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', checkedBg: 'bg-violet-400', hoverBorder: 'hover:border-violet-300', hoverText: 'hover:text-violet-400' },
  stone: { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', checkedBg: 'bg-stone-400', hoverBorder: 'hover:border-stone-300', hoverText: 'hover:text-stone-400' },
};

export function getCompletionData(habits: Habit[], days: number = 14) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    
    let completedCount = 0;
    habits.forEach(h => {
      if (h.completedDates.includes(dateStr)) completedCount++;
    });

    data.push({
      date: dateStr,
      displayDate: getDayName(dateStr),
      completed: completedCount,
      total: habits.length,
      percentage: habits.length > 0 ? (completedCount / habits.length) * 100 : 0
    });
  }
  return data;
}

export function getBestHabit(habits: Habit[]): { habit: Habit | null, streak: number } {
  let bestStreak = 0;
  let bestHabit: Habit | null = null;
  
  habits.forEach(h => {
    const streak = calculateStreak(h.completedDates);
    if (streak > bestStreak) {
      bestStreak = streak;
      bestHabit = h;
    }
  });
  
  return { habit: bestHabit, streak: bestStreak };
}

export function getTotalCompletions(habits: Habit[]): number {
  return habits.reduce((acc, h) => acc + h.completedDates.length, 0);
}

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'mock-1',
    title: 'El poder de los microhábitos',
    content: 'Muchas veces intentamos cambiar nuestra vida de un día para otro con metas gigantes. Sin embargo, la ciencia demuestra que empezar con "microhábitos" —acciones tan pequeñas que es imposible fallar— es la clave del éxito a largo plazo. \n\nPor ejemplo, en lugar de intentar leer un libro por semana, empieza por leer solo una página al día. La consistencia crea la identidad, y la identidad transforma el comportamiento.',
    author_id: 'coach-1',
    authorName: 'Coach Elena',
    date: '12 ago 2026',
    likes: 24,
    likedBy: [],
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop',
    comments: []
  },
  {
    id: 'mock-2',
    title: 'La importancia de la luz matutina',
    content: 'Exponer tus ojos a la luz natural del sol durante los primeros 30 a 60 minutos después de despertar es uno de los mejores hábitos que puedes incorporar. \n\nEsto ajusta tu ritmo circadiano, mejorando no solo tus niveles de energía y estado de ánimo durante el día, sino también la calidad de tu sueño por la noche.',
    author_id: 'coach-2',
    authorName: 'Coach Marcos',
    date: '10 ago 2026',
    likes: 18,
    likedBy: [],
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop',
    comments: []
  }
];
