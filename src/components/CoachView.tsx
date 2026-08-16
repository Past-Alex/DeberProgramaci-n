import React, { useState, useEffect } from 'react';
import { HabitTemplate, HabitColor, User, BlogPost } from '../types';
import { colorStyles, DEFAULT_BLOG_POSTS } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Library, LogOut, Trash2, BookOpen, Heart, UploadCloud, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

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
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('aesthetic-blog');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed : DEFAULT_BLOG_POSTS;
    }
    return DEFAULT_BLOG_POSTS;
  });
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('aesthetic-templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('aesthetic-blog', JSON.stringify(blogPosts));
  }, [blogPosts]);

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

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (postTitle.trim() && postContent.trim()) {
      const imageToUse = postImage || UNSPLASH_IMAGES[Math.floor(Math.random() * UNSPLASH_IMAGES.length)];
      const newPost: BlogPost = {
        id: crypto.randomUUID(),
        title: postTitle.trim(),
        content: postContent.trim(),
        authorName: user.name,
        date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
        likes: 0,
        likedBy: [],
        imageUrl: imageToUse
      };
      setBlogPosts([newPost, ...blogPosts]);
      setPostTitle('');
      setPostContent('');
      setPostImage(null);
    }
  };

  const handleDeletePost = (id: string) => {
    setBlogPosts(blogPosts.filter(p => p.id !== id));
  };

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    let updatedSelectedPost: BlogPost | null = null;
    const newComment = {
      id: crypto.randomUUID(),
      authorName: user.name,
      content: commentText.trim(),
      date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    const updatedPosts = blogPosts.map(p => {
      if (p.id === postId) {
        const updatedP = { ...p, comments: [...(p.comments || []), newComment] };
        if (selectedPost?.id === postId) updatedSelectedPost = updatedP;
        return updatedP;
      }
      return p;
    });

    setBlogPosts(updatedPosts);
    if (updatedSelectedPost) setSelectedPost(updatedSelectedPost);
    setCommentText('');
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    let updatedSelectedPost: BlogPost | null = null;
    const updatedPosts = blogPosts.map(p => {
      if (p.id === postId) {
        const updatedP = { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) };
        if (selectedPost?.id === postId) updatedSelectedPost = updatedP;
        return updatedP;
      }
      return p;
    });

    setBlogPosts(updatedPosts);
    if (updatedSelectedPost) setSelectedPost(updatedSelectedPost);
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
            onClick={onLogout}
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
            <span>Alumnos (Demo)</span>
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
                    Esta es una vista de demostración. Aquí podrías ver el progreso de los usuarios que han adoptado tus plantillas.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="p-4 border border-stone-100 rounded-2xl bg-stone-50">
                      <div className="font-outfit font-medium text-stone-800">Ana García</div>
                      <div className="text-sm text-stone-500">Racha actual: 12 días</div>
                      <div className="mt-3 w-full bg-stone-200 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full w-[80%]"></div></div>
                    </div>
                    <div className="p-4 border border-stone-100 rounded-2xl bg-stone-50">
                      <div className="font-outfit font-medium text-stone-800">Carlos Ruiz</div>
                      <div className="text-sm text-stone-500">Racha actual: 3 días</div>
                      <div className="mt-3 w-full bg-stone-200 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full w-[40%]"></div></div>
                    </div>
                  </div>
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
                            <button 
                              onClick={() => setPostToDelete(post.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 size={16} />
                            </button>
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
                  <button 
                    onClick={() => setPostToDelete(selectedPost.id)}
                    className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-full transition-colors shrink-0"
                    title="Eliminar publicación"
                  >
                    <Trash2 size={20} />
                  </button>
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
    </div>
  );
};
