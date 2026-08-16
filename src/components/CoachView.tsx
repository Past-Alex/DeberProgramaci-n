import React, { useState, useEffect } from 'react';
import { HabitTemplate, HabitColor, User, BlogPost } from '../types';
import { colorStyles, DEFAULT_BLOG_POSTS } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from './ConfirmModal';
import { createClient } from '@/utils/supabase/client';
import { BookOpen, Heart, Library, LogOut, Plus, Trash2, UploadCloud, Users, X, Edit2 } from 'lucide-react';

interface CoachViewProps {
  user: User;
  onLogout: () => void;
}

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800&auto=format&fit=crop'
];

export const CoachView: React.FC<CoachViewProps> = ({ user, onLogout }) => {
  const [templates, setTemplates] = useState<HabitTemplate[]>(() => {
    const saved = localStorage.getItem('aesthetic-templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: '1', name: 'Meditar 10 min', color: 'violet', description: 'Encuentra tu paz interior.' },
      { id: '2', name: 'Beber 2L de agua', color: 'sky', description: 'Mantente hidratado durante el día.' },
      { id: '3', name: 'Leer 20 páginas', color: 'amber', description: 'Alimenta tu mente.' }
    ];
  });

  const [activeTab, setActiveTab] = useState<'templates' | 'students' | 'blog'>('templates');
  
  // For new template
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState<HabitColor>('rose');
  const colors: HabitColor[] = ['rose', 'amber', 'emerald', 'sky', 'violet', 'stone'];

  // For blog
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [commentText, setCommentText] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Real students state
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      const supabase = createClient();
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user');

      if (profilesData && profilesData.length > 0) {
        const { data: habitsData } = await supabase.from('habits').select('id, user_id');
        const { data: allLogs } = await supabase.from('habit_logs').select('habit_id');
        
        const studentsList = profilesData.map(profile => {
          const userHabits = (habitsData || []).filter(h => h.user_id === profile.id);
          const userHabitIds = userHabits.map(h => h.id);
          const userLogsCount = (allLogs || []).filter(l => userHabitIds.includes(l.habit_id)).length;
          
          return {
            id: profile.id,
            name: profile.name,
            totalHabits: userHabits.length,
            totalCompletions: userLogsCount,
          };
        });
        setStudents(studentsList);
      }
      setLoadingStudents(false);
    };

    if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchBlog = async () => {
      const supabase = createClient();
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
    };
    fetchBlog();
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('aesthetic-templates', JSON.stringify(templates));
  }, [templates]);

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const newTemplate: HabitTemplate = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
      };
      setTemplates([...templates, newTemplate]);
      setName('');
      setDescription('');
      setSelectedColor('rose');
    }
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
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
      const imageToUse = postImage || UNSPLASH_IMAGES[Math.floor(Math.random() * UNSPLASH_IMAGES.length)];
      
      const newPostData = {
        title: postTitle.trim(),
        content: postContent.trim(),
        author_id: user.id,
        author_name: user.name || 'Coach',
        date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
        likes: 0,
        liked_by: [],
        comments: [],
        image_url: imageToUse
      };
      
      const supabase = createClient();
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
    }
  };

  const handleEditPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postToEdit && editPostTitle.trim() && editPostContent.trim()) {
      const supabase = createClient();
      await supabase.from('blog_posts').update({
        title: editPostTitle.trim(),
        content: editPostContent.trim()
      }).eq('id', postToEdit.id);
      
      const updatedP = { ...postToEdit, title: editPostTitle.trim(), content: editPostContent.trim() };
      setBlogPosts(blogPosts.map(p => p.id === postToEdit.id ? updatedP : p));
      if (selectedPost?.id === postToEdit.id) setSelectedPost(updatedP);
      setPostToEdit(null);
    }
  };

  const handleDeletePost = async (id: string) => {
    const supabase = createClient();
    await supabase.from('blog_posts').delete().eq('id', id);
    setBlogPosts(blogPosts.filter(p => p.id !== id));
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    const newComment = {
      id: crypto.randomUUID(),
      author_id: user.id,
      authorName: user.name,
      content: commentText.trim(),
      date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    const newComments = [...(post.comments || []), newComment];
    const supabase = createClient();
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
    const supabase = createClient();
    await supabase.from('blog_posts').update({ comments: newComments }).eq('id', postId);

    const updatedP = { ...post, comments: newComments };
    const updatedPosts = blogPosts.map(p => p.id === postId ? updatedP : p);
    setBlogPosts(updatedPosts);
    if (selectedPost?.id === postId) setSelectedPost(updatedP);
  };

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
              <span className="uppercase tracking-widest text-xs font-bold bg-stone-100 text-stone-500 px-2.5 py-1 rounded-md">Panel de Coach</span>
              <span>•</span>
              <span>Hola, {user.name}</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-playfair font-semibold text-stone-800 tracking-tight"
            >
              Centro de Guiado
            </motion.h1>
          </div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setLogoutConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-600 hover:text-stone-900 rounded-full font-outfit font-medium transition-all hover:shadow-sm"
          >
            <LogOut size={16} />
            <span className="text-sm">Salir</span>
          </motion.button>
        </header>

        {/* Navigation */}
        <nav className="flex flex-wrap gap-2 mb-10 p-1.5 bg-stone-100/50 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-outfit font-medium transition-all ${
              activeTab === 'templates' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
            }`}
          >
            <Library size={18} />
            <span>Plantillas</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-outfit font-medium transition-all ${
              activeTab === 'students' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
            }`}
          >
            <Users size={18} />
            <span>Alumnos</span>
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-outfit font-medium transition-all ${
              activeTab === 'blog' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
            }`}
          >
            <BookOpen size={18} />
            <span>Blog Comunitario</span>
          </button>
        </nav>

        {/* Main Content Area */}
        <div>
          <AnimatePresence mode="wait">
            {activeTab === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Add Template Form */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm sticky top-6">
                    <h2 className="font-playfair text-xl font-medium text-stone-800 mb-6">Nueva Plantilla</h2>
                    <form onSubmit={handleAddTemplate} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Título</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 font-outfit text-sm"
                          required
                          placeholder="Ej. Caminar 30 min"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Descripción</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 font-outfit text-sm resize-none h-24"
                          placeholder="Breve motivación o detalle..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2 font-outfit">Color</label>
                        <div className="flex gap-2">
                          {colors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setSelectedColor(color)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform
                                ${colorStyles[color].checkedBg}
                                ${selectedColor === color ? 'ring-2 ring-offset-2 ring-stone-400 scale-110 shadow-sm' : 'hover:scale-110 opacity-70'}
                              `}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors font-outfit flex items-center justify-center gap-2 text-sm mt-2"
                      >
                        <Plus size={16} />
                        <span>Publicar Plantilla</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Templates List */}
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="font-outfit font-medium text-stone-400 uppercase tracking-widest text-xs mb-2">Plantillas Activas ({templates.length})</h2>
                  
                  {templates.length === 0 ? (
                    <div className="text-center py-16 px-6 border border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                      <p className="font-outfit text-stone-400">No has creado plantillas todavía.</p>
                    </div>
                  ) : (
                    templates.map(template => {
                      const styles = colorStyles[template.color] || colorStyles.stone;
                      return (
                        <motion.div 
                          key={template.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-5 rounded-2xl border ${styles.border} bg-white shadow-sm flex items-start justify-between gap-4 group`}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${styles.checkedBg}`} />
                              <h3 className="font-outfit font-medium text-stone-800 text-lg">{template.name}</h3>
                            </div>
                            {template.description && (
                              <p className="font-outfit text-stone-500 text-sm ml-5">{template.description}</p>
                            )}
                          </div>
                          <button 
                            onClick={() => setTemplateToDelete(template.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'students' && (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center shadow-sm">
                  <Users size={32} className="mx-auto text-stone-300 mb-4" />
                  <h3 className="font-playfair text-xl text-stone-800 mb-2">Monitoreo de Alumnos</h3>
                  <p className="font-outfit text-stone-500 max-w-md mx-auto mb-6">
                    Aquí puedes ver el progreso de los alumnos registrados en la plataforma.
                  </p>
                  
                  {loadingStudents ? (
                    <div className="py-10 text-stone-400 flex flex-col items-center">
                      <svg className="animate-spin h-8 w-8 text-stone-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Cargando alumnos...</span>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-stone-400 py-10 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                      No hay alumnos registrados actualmente.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                      {students.map(student => (
                        <div key={student.id} className="p-5 border border-stone-100 rounded-2xl bg-stone-50 hover:shadow-sm transition-shadow">
                          <div className="font-outfit font-medium text-stone-800 text-lg mb-1">{student.name || 'Usuario'}</div>
                          <div className="text-sm text-stone-500 mb-3">
                            {student.totalHabits} hábitos creados
                          </div>
                          
                          <div className="text-xs text-stone-400 mb-1.5 flex justify-between">
                            <span>Progreso total</span>
                            <span className="font-medium text-emerald-600">{student.totalCompletions} completados</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-1.5">
                            <div 
                              className="bg-emerald-400 h-1.5 rounded-full transition-all" 
                              style={{ width: `${Math.min(100, (student.totalCompletions / (student.totalHabits * 7 || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {activeTab === 'blog' && (
              <motion.div
                key="blog"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Add Post Form */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm sticky top-6">
                    <h2 className="font-playfair text-xl font-medium text-stone-800 mb-6">Nuevo Artículo</h2>
                    <form onSubmit={handleAddPost} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Título</label>
                        <input
                          type="text"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 font-outfit text-sm"
                          required
                          placeholder="Ej. Los beneficios de madrugar"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Contenido</label>
                        <textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 font-outfit text-sm resize-none h-40"
                          required
                          placeholder="Comparte tus conocimientos..."
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
                              <p className="text-sm font-outfit text-center px-4">Arrastra una imagen o <span className="text-stone-800 font-medium">explora</span></p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={!postTitle.trim() || !postContent.trim()}
                        className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors font-outfit flex items-center justify-center gap-2 text-sm mt-2"
                      >
                        <Plus size={16} />
                        <span>Publicar Artículo</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Posts List */}
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="font-outfit font-medium text-stone-400 uppercase tracking-widest text-xs mb-2">Comunidad (Moderación) ({blogPosts.length})</h2>
                  
                  {blogPosts.length === 0 ? (
                    <div className="text-center py-16 px-6 border border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                      <p className="font-outfit text-stone-400">No hay publicaciones en la comunidad.</p>
                    </div>
                  ) : (
                    blogPosts.map(post => (
                      <motion.div 
                        key={post.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-stone-200 bg-white shadow-sm flex flex-col group overflow-hidden"
                      >
                        {post.imageUrl && (
                          <div className="h-48 w-full relative border-b border-stone-100">
                            <img 
                              src={post.imageUrl} 
                              alt={post.title} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className="p-6 flex flex-col gap-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-playfair font-semibold text-stone-800 text-2xl mb-1">{post.title}</h3>
                              <div className="flex items-center gap-2 text-stone-400 text-xs font-outfit">
                                <span>Por {post.authorName}</span>
                                <span>•</span>
                                <span>{post.date}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {user.id === post.author_id && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditPostTitle(post.title); setEditPostContent(post.content); setPostToEdit(post); }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                                  title="Editar publicación"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                              )}
                              <button 
                                onClick={() => setPostToDelete(post.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                title="Eliminar publicación"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <p className="font-outfit text-stone-600 text-sm whitespace-pre-wrap line-clamp-3">{post.content}</p>
                          <button 
                            onClick={() => setSelectedPost(post)}
                            className="text-stone-800 font-medium text-sm font-outfit self-start hover:underline mt-1"
                          >
                            Leer artículo completo →
                          </button>
                          <div className="flex items-center gap-1.5 text-rose-500 text-sm font-outfit font-medium mt-2">
                            <Heart size={16} className={post.likes > 0 ? "fill-current" : ""} />
                            <span>{post.likes}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
                  <div className="flex gap-2">
                    {user.id === selectedPost.author_id && (
                      <button 
                        onClick={() => { setEditPostTitle(selectedPost.title); setEditPostContent(selectedPost.content); setPostToEdit(selectedPost); setSelectedPost(null); }}
                        className="text-stone-400 hover:text-blue-500 hover:bg-blue-50 p-3 rounded-full transition-colors shrink-0"
                        title="Editar publicación"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                    )}
                    <button 
                      onClick={() => setPostToDelete(selectedPost.id)}
                      className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-full transition-colors shrink-0"
                      title="Eliminar publicación"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="w-full h-px bg-stone-100" />
                
                <p className="font-outfit text-stone-700 leading-relaxed whitespace-pre-wrap text-lg">
                  {selectedPost.content}
                </p>
                
                <div className="mt-4 flex items-center gap-1.5 text-rose-500 font-outfit font-medium">
                  <Heart size={20} className={selectedPost.likes > 0 ? "fill-current" : ""} />
                  <span>{selectedPost.likes} {selectedPost.likes === 1 ? 'Me gusta' : 'Me gusta'}</span>
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
                          <button
                            onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                            className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                            title="Eliminar comentario"
                          >
                            <Trash2 size={14} />
                          </button>
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
        isOpen={!!templateToDelete}
        title="Eliminar plantilla"
        message="¿Estás seguro de que quieres eliminar esta plantilla? Los usuarios ya no podrán verla ni adoptarla."
        onClose={() => setTemplateToDelete(null)}
        onConfirm={() => templateToDelete && handleDeleteTemplate(templateToDelete)}
      />

      <ConfirmModal
        isOpen={!!postToDelete}
        title="Eliminar publicación"
        message="¿Estás seguro de que quieres eliminar esta publicación de la comunidad? Esta acción no se puede deshacer."
        onClose={() => setPostToDelete(null)}
        onConfirm={() => {
          if (postToDelete) {
            handleDeletePost(postToDelete);
            if (selectedPost?.id === postToDelete) {
              setSelectedPost(null);
            }
          }
        }}
      />

      <ConfirmModal
        isOpen={logoutConfirm}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        confirmText="Confirmar"
        onClose={() => setLogoutConfirm(false)}
        onConfirm={onLogout}
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
};
