"use client";
import React, { useState, useEffect } from 'react';
import { BlogPost, Habit, HabitColor, User, HabitTemplate } from './types';
import { HabitCard } from './components/HabitCard';
import { AddHabitModal } from './components/AddHabitModal';
import { EditHabitModal } from './components/EditHabitModal';
import { TodayView } from './components/TodayView';
import { StatsView } from './components/StatsView';
import LoginPage from './app/login/page';
import { CoachView } from './components/CoachView';
import { ConfirmModal } from './components/ConfirmModal';
import { MotivationalToast } from './components/MotivationalToast';
import { getToday, colorStyles, DEFAULT_BLOG_POSTS } from './utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Sparkles, LayoutDashboard, ListTodo, BarChart3, LogOut, Download, BookOpen, Heart, Image as ImageIcon, UploadCloud, X, Trash2, UserCircle, Globe, Check } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
type Tab = 'today' | 'habits' | 'stats' | 'templates' | 'blog';

export default function App({ initialUser }: { initialUser: User }) {
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [templates, setTemplates] = useState<HabitTemplate[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const supabase = createClient();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [isPublishing, setIsPublishing] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('success') === '1') {
        setToastMessage('¡Hábito añadido exitosamente!');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    const fetchHabits = async () => {
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', currentUser.id);
        
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
      
      const savedTemplates = localStorage.getItem('aesthetic-templates');
      if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
      
      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (blogData) {
        setBlogPosts(blogData.map(p => ({
          id: p.id,
          title: p.title,
          content: p.content,
          author_id: p.author_id,
          authorName: p.author_name,
          date: p.date,
          likes: p.likes,
          imageUrl: p.image_url,
          likedBy: p.liked_by || [],
          comments: p.comments || []
        })));
      }
      
      setIsLoaded(true);
    };
    
    fetchHabits();
  }, [currentUser.id, supabase]);

  // Keep templates in sync for the user view if coach added them
  useEffect(() => {
    if (!isLoaded) return;
    const handleStorageChange = () => {
      const savedTemplates = localStorage.getItem('aesthetic-templates');
      if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isLoaded]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (!isLoaded) {
    return null;
  }

  if (currentUser.role === 'coach') {
    return <CoachView user={currentUser} onLogout={handleLogout} />;
  }

  // --- USER VIEW ---

  const handleAddHabit = (data: any) => {
    if (data) {
      const newHabit: Habit = {
        id: data.id,
        name: data.name,
        color: data.color as HabitColor,
        completedDates: [],
        createdAt: data.created_at,
      };
      setHabits([...habits, newHabit]);
      setToastMessage('¡Hábito creado exitosamente!');
    }
  };
  
  const handleAdoptTemplate = async (template: HabitTemplate) => {
    const formData = new FormData();
    formData.append('name', template.name);
    formData.append('color', template.color);
    try {
      const { createHabit } = await import('./app/actions');
      const newHabit = await createHabit(formData);
      handleAddHabit(newHabit);
      setActiveTab('today');
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleDay = async (habitId: string, dateStr: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(dateStr);
    
    if (isCompleted) {
      await supabase
        .from('habit_logs')
        .delete()
        .match({ habit_id: habitId, completed_date: dateStr });
        
      setHabits(habits.map(h => 
        h.id === habitId 
          ? { ...h, completedDates: h.completedDates.filter(d => d !== dateStr) }
          : h
      ));
    } else {
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, completed_date: dateStr });
        
      setHabits(habits.map(h => 
        h.id === habitId 
          ? { ...h, completedDates: [...h.completedDates, dateStr] }
          : h
      ));
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    const formData = new FormData();
    formData.append('id', habitId);
    try {
      const { deleteHabit } = await import('./app/actions');
      await deleteHabit(formData);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPostImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postTitle.trim() && postContent.trim()) {
      const UNSPLASH_IMAGES = [
        'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800&auto=format&fit=crop'
      ];
      
      const imageToUse = postImage || UNSPLASH_IMAGES[Math.floor(Math.random() * UNSPLASH_IMAGES.length)];
      
      const newPostData = {
        title: postTitle.trim(),
        content: postContent.trim(),
        author_id: currentUser.id,
        author_name: currentUser.name || 'Usuario',
        date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
        likes: 0,
        liked_by: [],
        comments: [],
        image_url: imageToUse
      };
      
      const { data, error } = await supabase.from('blog_posts').insert(newPostData).select().single();
      if (!error && data) {
        const newPost: BlogPost = {
          id: data.id,
          title: data.title,
          content: data.content,
          author_id: data.author_id,
          authorName: data.author_name,
          date: data.date,
          likes: data.likes,
          likedBy: data.liked_by,
          comments: data.comments,
          imageUrl: data.image_url
        };
        setBlogPosts([newPost, ...blogPosts]);
      }
      
      setPostTitle('');
      setPostContent('');
      setPostImage(null);
      setIsPublishing(false);
    }
  };

  const handleEditPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postToEdit && editPostTitle.trim() && editPostContent.trim()) {
      await supabase.from('blog_posts').update({
        title: editPostTitle.trim(),
        content: editPostContent.trim()
      }).eq('id', postToEdit.id);
      
      const updatedP = { ...postToEdit, title: editPostTitle.trim(), content: editPostContent.trim() };
      setBlogPosts(blogPosts.map(p => p.id === postToEdit.id ? updatedP : p));
      if (selectedPost?.id === postToEdit.id) setSelectedPost(updatedP);
      setPostToEdit(null);
      setToastMessage('¡Publicación actualizada exitosamente!');
    }
  };

  const handleDeletePost = async (postId: string) => {
    await supabase.from('blog_posts').delete().eq('id', postId);
    const updatedPosts = blogPosts.filter(p => p.id !== postId);
    setBlogPosts(updatedPosts);
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
    }
  };

  const handleLikePost = async (postId: string) => {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    const currentLikedBy = post.likedBy || [];
    const hasLiked = currentLikedBy.includes(currentUser.id);
    
    const newLikes = hasLiked ? Math.max(0, post.likes - 1) : post.likes + 1;
    const newLikedBy = hasLiked 
      ? currentLikedBy.filter(id => id !== currentUser.id)
      : [...currentLikedBy, currentUser.id];
      
    await supabase.from('blog_posts').update({ likes: newLikes, liked_by: newLikedBy }).eq('id', postId);

    const updatedP = { ...post, likes: newLikes, likedBy: newLikedBy };
    const updatedPosts = blogPosts.map(p => p.id === postId ? updatedP : p);
    setBlogPosts(updatedPosts);
    if (selectedPost?.id === postId) {
      setSelectedPost(updatedP);
    }
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    const newComment = {
      id: crypto.randomUUID(),
      author_id: currentUser.id,
      authorName: currentUser.name,
      content: commentText.trim(),
      date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    const newComments = [...(post.comments || []), newComment];
    await supabase.from('blog_posts').update({ comments: newComments }).eq('id', postId);

    const updatedP = { ...post, comments: newComments };
    const updatedPosts = blogPosts.map(p => p.id === postId ? updatedP : p);
    setBlogPosts(updatedPosts);
    if (selectedPost?.id === postId) setSelectedPost(updatedP);
    setCommentText('');
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    const newComments = (post.comments || []).filter(c => c.id !== commentId);
    await supabase.from('blog_posts').update({ comments: newComments }).eq('id', postId);

    const updatedP = { ...post, comments: newComments };
    const updatedPosts = blogPosts.map(p => p.id === postId ? updatedP : p);
    setBlogPosts(updatedPosts);
    if (selectedPost?.id === postId) setSelectedPost(updatedP);
  };

  const todayStr = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedToday = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  return (
    <div className="min-h-screen bg-[#FDFCF8] selection:bg-stone-200">
      <div className="max-w-5xl mx-auto px-5 py-12 md:py-20">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-stone-400 mb-2 font-outfit font-medium"
            >
              <Sparkles size={16} />
              <span>{formattedToday}</span>
              <span className="mx-1">•</span>
              <span>Hola, {currentUser.name}</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-playfair font-semibold text-stone-800 tracking-tight"
            >
              Mis Hábitos
            </motion.h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/perfil"
              className="p-3 bg-white border border-stone-200 text-stone-400 hover:text-stone-700 rounded-full transition-all hover:shadow-sm"
              title="Mi Perfil"
            >
              <UserCircle size={18} />
            </Link>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={handleLogout}
              className="p-3 bg-white border border-stone-200 text-stone-400 hover:text-stone-700 rounded-full transition-all hover:shadow-sm"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full font-outfit font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span>Nuevo hábito</span>
            </motion.button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="flex flex-wrap gap-2 mb-10 p-1.5 bg-stone-100/50 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-outfit font-medium transition-all ${
              activeTab === 'today' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Hoy</span>
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-outfit font-medium transition-all ${
              activeTab === 'habits' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
            }`}
          >
            <ListTodo size={18} />
            <span>Hábitos</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-outfit font-medium transition-all ${
              activeTab === 'stats' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
            }`}
          >
            <BarChart3 size={18} />
            <span>Progreso</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-outfit font-medium transition-all ${
              activeTab === 'templates' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
            }`}
          >
            <Download size={18} />
            <span>Sugeridos</span>
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-outfit font-medium transition-all ${
              activeTab === 'blog' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
            }`}
          >
            <BookOpen size={18} />
            <span>Blog</span>
          </button>
          
          <div className="w-px h-8 bg-stone-200 my-auto mx-1"></div>

          <Link
            href="/explorar"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-outfit font-medium transition-all text-stone-500 hover:text-stone-700 hover:bg-stone-100/50"
          >
            <Globe size={18} />
            <span>Comunidad</span>
          </Link>
        </nav>

        {/* Main Content Area */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'today' && (
                <TodayView habits={habits} onToggleDay={handleToggleDay} />
              )}
              
              {activeTab === 'stats' && (
                <StatsView habits={habits} />
              )}

              {activeTab === 'habits' && (
                <div className="space-y-6">
                  {habits.length > 0 && (
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Buscar hábitos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl font-outfit focus:outline-none focus:ring-2 focus:ring-stone-200 shadow-sm transition-all"
                      />
                    </div>
                  )}
                  <div className="space-y-4">
                    {habits.length === 0 ? (
                      <div className="text-center py-20 px-6 border border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-stone-100 text-stone-300">
                          <Sparkles size={24} />
                        </div>
                        <h3 className="font-playfair text-xl text-stone-600 mb-2">Comienza tu viaje</h3>
                        <p className="font-outfit text-stone-400 max-w-sm mx-auto">
                          Añade tu primer hábito para empezar a rastrear tu progreso diario.
                        </p>
                      </div>
                    ) : (
                      habits
                        .filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((habit) => (
                          <HabitCard
                            key={habit.id}
                            habit={habit}
                            onToggleDay={handleToggleDay}
                            onDelete={setHabitToDelete}
                            onEdit={setHabitToEdit}
                          />
                        ))
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className="font-playfair text-2xl text-stone-800 mb-2">Plantillas del Coach</h2>
                    <p className="font-outfit text-stone-500">Adopta hábitos sugeridos por tu coach para mejorar tu rutina.</p>
                  </div>
                  
                  {templates.length === 0 ? (
                    <div className="text-center py-20 px-6 border border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                      <p className="font-outfit text-stone-400">Tu coach aún no ha publicado plantillas.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {templates.map(template => {
                        const styles = colorStyles[template.color] || colorStyles.stone;
                        return (
                          <motion.div 
                            key={template.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-3xl border ${styles.border} bg-white shadow-sm flex flex-col justify-between group`}
                          >
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-4 h-4 rounded-full ${styles.checkedBg}`} />
                                <h3 className="font-outfit font-semibold text-stone-800 text-xl">{template.name}</h3>
                              </div>
                              {template.description && (
                                <p className="font-outfit text-stone-500 text-sm">{template.description}</p>
                              )}
                            </div>
                            <button 
                              onClick={() => handleAdoptTemplate(template)}
                              className={`w-full py-2.5 rounded-xl font-outfit font-medium transition-colors bg-stone-50 hover:${styles.bg} text-stone-700 hover:${styles.text} border border-stone-200 flex justify-center items-center gap-2`}
                            >
                              <Plus size={16} />
                              <span>Adoptar Hábito</span>
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'blog' && (
                <div className="space-y-4">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="font-playfair text-2xl text-stone-800 mb-2">Comunidad</h2>
                      <p className="font-outfit text-stone-500">Comparte tu progreso y lee consejos de la comunidad.</p>
                    </div>
                    <button
                      onClick={() => setIsPublishing(!isPublishing)}
                      className="px-4 py-2 bg-stone-800 text-white font-outfit rounded-xl hover:bg-stone-700 transition-colors"
                    >
                      {isPublishing ? 'Cancelar' : 'Publicar'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {isPublishing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <form onSubmit={handleAddPost} className="p-6 rounded-3xl border border-stone-200 bg-white shadow-sm space-y-4 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Título</label>
                            <input
                              type="text"
                              value={postTitle}
                              onChange={(e) => setPostTitle(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 font-outfit text-sm"
                              required
                              placeholder="Ej. Mi primer día de hábitos"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Contenido</label>
                            <textarea
                              value={postContent}
                              onChange={(e) => setPostContent(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 font-outfit text-sm resize-none h-32"
                              required
                              placeholder="Escribe lo que quieras compartir con la comunidad..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Imagen (Opcional)</label>
                            <div 
                              className={`relative w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${dragActive ? 'border-stone-800 bg-stone-100/50' : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'}`}
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                            >
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              
                              {postImage ? (
                                <div className="absolute inset-0 w-full h-full group">
                                  <img src={postImage} alt="Preview" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                      type="button"
                                      onClick={(e) => { e.preventDefault(); setPostImage(null); }}
                                      className="p-2 bg-white rounded-full text-stone-800 hover:scale-105 transition-transform z-20"
                                    >
                                      <X size={20} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-stone-500 pointer-events-none">
                                  <UploadCloud size={24} className="mb-2 text-stone-400" />
                                  <p className="text-sm font-outfit">Arrastra una imagen o <span className="text-stone-800 font-medium">explora</span></p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              disabled={!postTitle.trim() || !postContent.trim()}
                              className="px-6 py-2.5 rounded-xl bg-stone-800 text-white font-outfit font-medium transition-colors hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Publicar Artículo
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {blogPosts.length === 0 ? (
                    <div className="text-center py-20 px-6 border border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                      <p className="font-outfit text-stone-400">Todavía no hay artículos publicados en el blog.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {blogPosts.map(post => {
                        const hasLiked = (post.likedBy || []).includes(currentUser.id);
                        return (
                        <motion.div 
                          key={post.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-3xl border border-stone-200 bg-white shadow-sm flex flex-col overflow-hidden group"
                        >
                          {post.imageUrl && (
                            <div className="h-56 md:h-72 w-full relative border-b border-stone-100">
                              <img 
                                src={post.imageUrl} 
                                alt={post.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div className="p-6 md:p-8 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-playfair font-semibold text-stone-800 text-2xl mb-2">{post.title}</h3>
                                <div className="flex items-center gap-2 text-stone-400 text-sm font-outfit">
                                  <span className="text-stone-600 font-medium">Por {post.authorName}</span>
                                  <span>•</span>
                                  <span>{post.date}</span>
                                </div>
                              </div>
                              {currentUser?.id === post.author_id && (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setEditPostTitle(post.title); setEditPostContent(post.content); setPostToEdit(post); }}
                                    className="text-stone-400 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                    title="Editar publicación"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setPostToDelete(post.id); }}
                                    className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                    title="Eliminar publicación"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="font-outfit text-stone-600 leading-relaxed whitespace-pre-wrap line-clamp-3">{post.content}</p>
                            
                            <button 
                              onClick={() => setSelectedPost(post)}
                              className="text-stone-800 font-medium text-sm font-outfit self-start hover:underline"
                            >
                              Leer artículo completo →
                            </button>
                            
                            <div className="mt-2 flex items-center">
                              <button
                                onClick={() => handleLikePost(post.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors font-outfit text-sm font-medium ${
                                  hasLiked 
                                    ? 'border-rose-200 bg-rose-50 text-rose-500' 
                                    : 'border-stone-200 text-stone-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50'
                                }`}
                              >
                                <Heart size={16} className={hasLiked ? "fill-current text-rose-500" : ""} />
                                <span>{post.likes} {post.likes === 1 ? 'Me gusta' : 'Me gusta'}</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )})}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddHabit}
      />

      <EditHabitModal
        isOpen={!!habitToEdit}
        onClose={() => setHabitToEdit(null)}
        habit={habitToEdit}
        onUpdate={(updatedHabit) => {
          setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
          setToastMessage('¡Hábito actualizado exitosamente!');
        }}
      />

      <ConfirmModal
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirm={() => {
          if (habitToDelete) {
            handleDeleteHabit(habitToDelete);
            setToastMessage('¡Hábito eliminado exitosamente!');
          }
        }}
        title="Eliminar hábito"
        message="¿Estás seguro de que deseas eliminar este hábito? Esta acción no se puede deshacer y perderás todo tu progreso."
      />

      <ConfirmModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={() => {
          if (postToDelete) {
            handleDeletePost(postToDelete);
            setToastMessage('¡Publicación eliminada!');
          }
        }}
        title="Eliminar publicación"
        message="¿Estás seguro de que deseas eliminar esta publicación del blog? Esta acción no se puede deshacer."
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg font-outfit font-medium flex items-center gap-2"
          >
            <Check size={18} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <MotivationalToast />

      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setSelectedPost(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-xl overflow-y-auto flex flex-col"
            >
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 z-10 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
              
              {selectedPost.imageUrl && (
                <div className="h-64 md:h-80 w-full shrink-0 relative">
                  <img 
                    src={selectedPost.imageUrl} 
                    alt={selectedPost.title} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              
              <div className="p-8 md:p-10 flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-playfair font-semibold text-stone-800 text-3xl mb-4">{selectedPost.title}</h3>
                    <div className="flex items-center gap-2 text-stone-400 text-sm font-outfit">
                      <span className="text-stone-600 font-medium">Por {selectedPost.authorName}</span>
                      <span>•</span>
                      <span>{selectedPost.date}</span>
                    </div>
                  </div>
                  {currentUser?.id === selectedPost.author_id && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditPostTitle(selectedPost.title); setEditPostContent(selectedPost.content); setPostToEdit(selectedPost); setSelectedPost(null); }}
                        className="text-stone-400 hover:text-blue-500 hover:bg-blue-50 p-3 rounded-full transition-colors shrink-0"
                        title="Editar publicación"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button 
                        onClick={() => { setPostToDelete(selectedPost.id); setSelectedPost(null); }}
                        className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-full transition-colors shrink-0"
                        title="Eliminar publicación"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="w-full h-px bg-stone-100" />
                
                <p className="font-outfit text-stone-700 leading-relaxed whitespace-pre-wrap text-lg">
                  {selectedPost.content}
                </p>
                
                <div className="mt-4 flex items-center">
                  <button
                    onClick={() => handleLikePost(selectedPost.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-colors font-outfit font-medium ${
                      (selectedPost.likedBy || []).includes(currentUser?.id || '')
                        ? 'border-rose-200 bg-rose-50 text-rose-500' 
                        : 'border-stone-200 text-stone-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <Heart size={20} className={(selectedPost.likedBy || []).includes(currentUser?.id || '') ? "fill-current text-rose-500" : ""} />
                    <span>{(selectedPost.likes || 0)} {selectedPost.likes === 1 ? 'Me gusta' : 'Me gusta'}</span>
                  </button>
                </div>

                <div className="w-full h-px bg-stone-100 my-2" />

                <div className="flex flex-col gap-6">
                  <h4 className="font-playfair text-xl text-stone-800">Comentarios ({(selectedPost.comments || []).length})</h4>
                  
                  <div className="space-y-4">
                    {(selectedPost.comments || []).map((comment) => (
                      <div key={comment.id} className="bg-stone-50 p-4 rounded-2xl flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-outfit">
                            <span className="font-medium text-stone-800">{comment.authorName}</span>
                            <span className="text-stone-400">•</span>
                            <span className="text-stone-400">{comment.date}</span>
                          </div>
                          {(currentUser?.id === comment.author_id || currentUser?.id === selectedPost.author_id || currentUser?.role === 'coach') && (
                            <button
                              onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                              className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                              title="Eliminar comentario"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="font-outfit text-stone-600 text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                    
                    {(selectedPost.comments || []).length === 0 && (
                      <p className="font-outfit text-stone-400 text-sm text-center py-4">Aún no hay comentarios. ¡Sé el primero en compartir tu opinión!</p>
                    )}
                  </div>

                  <form onSubmit={(e) => handleAddComment(e, selectedPost.id)} className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Escribe un comentario..."
                      className="flex-1 px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 font-outfit text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-full font-medium transition-colors font-outfit text-sm"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!habitToDelete}
        title="Eliminar hábito"
        message="¿Estás seguro de que quieres eliminar este hábito? Perderás todo el historial de progreso asociado a él."
        onClose={() => setHabitToDelete(null)}
        onConfirm={() => habitToDelete && handleDeleteHabit(habitToDelete)}
      />

      <ConfirmModal
        isOpen={!!postToDelete}
        title="Eliminar publicación"
        message="¿Estás seguro de que quieres eliminar esta publicación de la comunidad? Esta acción no se puede deshacer."
        onClose={() => setPostToDelete(null)}
        onConfirm={() => postToDelete && handleDeletePost(postToDelete)}
      />

      <AnimatePresence>
        {postToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setPostToEdit(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8"
            >
              <button 
                onClick={() => setPostToEdit(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 z-10 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
              
              <h2 className="font-playfair text-2xl text-stone-800 mb-6">Editar Publicación</h2>
              <form onSubmit={handleEditPostSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Título</label>
                  <input
                    type="text"
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 font-outfit text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Contenido</label>
                  <textarea
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 font-outfit text-sm resize-none h-40"
                    required
                  />
                </div>
                <div className="flex justify-end pt-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPostToEdit(null)}
                    className="px-6 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-outfit font-medium transition-colors hover:bg-stone-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!editPostTitle.trim() || !editPostContent.trim()}
                    className="px-6 py-2.5 rounded-xl bg-stone-800 text-white font-outfit font-medium transition-colors hover:bg-stone-700 disabled:opacity-50"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
