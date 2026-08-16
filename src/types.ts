export type HabitColor = 'rose' | 'amber' | 'emerald' | 'sky' | 'violet' | 'stone';

export interface Habit {
  id: string;
  name: string;
  color: HabitColor;
  completedDates: string[]; // Formato YYYY-MM-DD
  createdAt: string; // Formato YYYY-MM-DD
}

export type Role = 'user' | 'coach';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface HabitTemplate {
  id: string;
  name: string;
  color: HabitColor;
  description: string;
}

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  authorName: string;
  date: string;
  likes: number;
  imageUrl?: string;
  likedBy: string[];
  comments?: Comment[];
}
