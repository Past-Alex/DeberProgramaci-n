import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Image as ImageIcon, UploadCloud, X, Trash2 } from 'lucide-react';
import { User, BlogPost } from '../../types';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogPostCard } from './BlogPostCard';
import { ConfirmModal } from '../ConfirmModal';
import { ReactionButton } from './ReactionButton';

interface BlogViewProps {
  currentUser: User;
}

export const BlogView: React.FC<BlogViewProps> = ({ currentUser }) => {
  const { 
    blogPosts, 
    isLoading, 
    addPost, 
    updatePost, 
    deletePost, 
    likePost, 
    addComment, 
    deleteComment 
  } = useBlogPosts();

  const [isPublishing, setIsPublishing] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [commentText, setCommentText] = useState('');
  
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');

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
    if (!postTitle.trim() || !postContent.trim()) return;
    
    await addPost({
      title: postTitle,
      content: postContent,
      author_id: currentUser.id,
      authorName: currentUser.name,
      date: new Date().toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' }),
      imageUrl: postImage || undefined
    });
    
    setPostTitle('');
    setPostContent('');
    setPostImage(null);
    setIsPublishing(false);
  };

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postToEdit || !editPostTitle.trim() || !editPostContent.trim()) return;
    
    await updatePost(postToEdit.id, {
      title: editPostTitle,
      content: editPostContent,
    });
    
    setPostToEdit(null);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentText.trim()) return;
    
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      author_id: currentUser.id,
      authorName: currentUser.name,
      content: commentText,
      date: new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    };
    
    await addComment(selectedPost.id, newComment);
    setCommentText('');
    
    // Optimistic UI update for selected post modal
    setSelectedPost(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : prev);
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    await deleteComment(postId, commentId);
    
    // Optimistic UI update for selected post modal
    setSelectedPost(prev => prev ? { 
      ...prev, 
      comments: (prev.comments || []).filter(c => c.id !== commentId) 
    } : prev);
  };

  return (
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
      
      <div className="mb-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar publicaciones por título o contenido..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 font-outfit text-stone-800 bg-white shadow-sm"
          />
          <svg className="w-5 h-5 absolute left-4 top-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 font-outfit text-stone-800"
                  placeholder="Ej: Mi primera semana completando todos mis hábitos"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Contenido</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 font-outfit min-h-[120px] resize-none text-stone-800"
                  placeholder="Comparte tu experiencia, tips o dudas con la comunidad..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Imagen (Opcional)</label>
                {!postImage ? (
                  <div 
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragActive ? 'border-stone-400 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}
                  >
                    <input
                      type="file"
                      id="image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 mb-2">
                        <UploadCloud size={24} />
                      </div>
                      <span className="font-outfit text-sm text-stone-600">Haz clic para subir o arrastra una imagen</span>
                      <span className="font-outfit text-xs text-stone-400">PNG, JPG, GIF hasta 5MB</span>
                    </label>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden h-48 border border-stone-200">
                    <img src={postImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPostImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-stone-600 hover:text-red-500 shadow-sm"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPublishing(false);
                    setPostImage(null);
                  }}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 font-outfit font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-800 text-white rounded-xl hover:bg-stone-700 font-outfit font-medium flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span>Publicar</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
        </div>
      ) : blogPosts.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-stone-200 bg-white">
          <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-4 text-stone-400">
            <ImageIcon size={32} />
          </div>
          <h3 className="font-playfair text-xl text-stone-800 mb-2">Aún no hay publicaciones</h3>
          <p className="font-outfit text-stone-500 mb-6">Sé el primero en compartir algo con la comunidad.</p>
          <button
            onClick={() => setIsPublishing(true)}
            className="px-6 py-2 bg-stone-800 text-white rounded-xl hover:bg-stone-700 font-outfit font-medium inline-flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Crear publicación</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {blogPosts.filter(post => 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(post => (
            <BlogPostCard 
              key={post.id} 
              post={post}
              currentUserId={currentUser.id}
              isAuthor={currentUser.id === post.author_id || currentUser.role === 'coach'}
              onLike={(postId, type) => {
                likePost(postId, currentUser.id, type);
                if (selectedPost && selectedPost.id === postId) {
                  // Optimistic UI for modal
                  let newLikedBy = [...(selectedPost.likedBy || [])];
                  const existingIndex = newLikedBy.findIndex(r => r.startsWith(`${currentUser.id}:`) || r === currentUser.id);
                  if (existingIndex !== -1) {
                    const existingReaction = newLikedBy[existingIndex].includes(':') ? newLikedBy[existingIndex].split(':')[1] : 'like';
                    if (existingReaction === type) {
                      newLikedBy.splice(existingIndex, 1);
                    } else {
                      newLikedBy[existingIndex] = `${currentUser.id}:${type}`;
                    }
                  } else {
                    newLikedBy.push(`${currentUser.id}:${type}`);
                  }
                  setSelectedPost({ ...selectedPost, likedBy: newLikedBy });
                }
              }}
              onReadMore={setSelectedPost}
              onEdit={setPostToEdit}
              onDelete={setPostToDelete}
            />
          ))}
        </div>
      )}

      {/* FULL POST MODAL */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-stone-500 hover:text-stone-800 transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <div className="overflow-y-auto flex-1">
                {selectedPost.imageUrl && (
                  <div className="h-64 md:h-80 w-full relative">
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
                    {(currentUser.id === selectedPost.author_id || currentUser.role === 'coach') && (
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
                  
                  <ReactionButton 
                    likedBy={selectedPost.likedBy || []}
                    userId={currentUser.id}
                    onLike={(type) => {
                      likePost(selectedPost.id, currentUser.id, type);
                      // Optimistic Update
                      let newLikedBy = [...(selectedPost.likedBy || [])];
                      const existingIndex = newLikedBy.findIndex(r => r.startsWith(`${currentUser.id}:`) || r === currentUser.id);
                      if (existingIndex !== -1) {
                        const existingReaction = newLikedBy[existingIndex].includes(':') ? newLikedBy[existingIndex].split(':')[1] : 'like';
                        if (existingReaction === type) {
                          newLikedBy.splice(existingIndex, 1);
                        } else {
                          newLikedBy[existingIndex] = `${currentUser.id}:${type}`;
                        }
                      } else {
                        newLikedBy.push(`${currentUser.id}:${type}`);
                      }
                      setSelectedPost({ ...selectedPost, likedBy: newLikedBy });
                    }}
                    size="md"
                  />

                  <div className="w-full h-px bg-stone-100 my-2" />
                  
                  <div className="flex flex-col gap-4">
                    <h4 className="font-playfair font-semibold text-stone-800 text-xl">
                      Comentarios ({(selectedPost.comments || []).length})
                    </h4>
                    
                    <div className="flex flex-col gap-4">
                      {(selectedPost.comments || []).map((comment) => (
                        <div key={comment.id} className="flex flex-col p-4 bg-stone-50 rounded-2xl relative group/comment">
                          {(currentUser.id === comment.author_id || currentUser.role === 'coach') && (
                            <button 
                              onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                              className="absolute top-4 right-4 text-stone-400 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-outfit font-medium text-stone-800">{comment.authorName}</span>
                            <span className="text-stone-400 text-sm font-outfit">• {comment.date}</span>
                          </div>
                          <p className="font-outfit text-stone-600 text-sm leading-relaxed">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleComment} className="mt-4 flex gap-3">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Escribe un comentario..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 font-outfit text-sm text-stone-800"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="px-6 py-2.5 bg-stone-800 text-white rounded-xl hover:bg-stone-700 font-outfit font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Enviar
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALS PARA EDITAR/ELIMINAR POST */}
      <AnimatePresence>
        {postToDelete && (
          <ConfirmModal
            isOpen={!!postToDelete}
            onClose={() => setPostToDelete(null)}
            onConfirm={() => {
              deletePost(postToDelete);
              setPostToDelete(null);
            }}
            title="Eliminar publicación"
            message="¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer."
            confirmText="Eliminar"
            cancelText="Cancelar"
          />
        )}

        {postToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPostToEdit(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-playfair font-semibold text-stone-800">Editar publicación</h3>
                  <button onClick={() => setPostToEdit(null)} className="text-stone-400 hover:text-stone-600">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleEditPost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Título</label>
                    <input
                      type="text"
                      value={editPostTitle}
                      onChange={(e) => setEditPostTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 font-outfit text-stone-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5 font-outfit">Contenido</label>
                    <textarea
                      value={editPostContent}
                      onChange={(e) => setEditPostContent(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 font-outfit min-h-[150px] resize-none text-stone-800"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setPostToEdit(null)}
                      className="px-4 py-2 text-stone-500 hover:text-stone-700 font-outfit font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-stone-800 text-white rounded-xl hover:bg-stone-700 font-outfit font-medium"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
