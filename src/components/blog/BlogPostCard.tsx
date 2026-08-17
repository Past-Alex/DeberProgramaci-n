import React from 'react';
import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { BlogPost, ReactionType } from '../../types';
import { ReactionButton } from './ReactionButton';

interface BlogPostCardProps {
  post: BlogPost;
  currentUserId: string;
  isAuthor: boolean;
  onLike: (postId: string, type: ReactionType) => void;
  onReadMore: (post: BlogPost) => void;
  onEdit?: (post: BlogPost) => void;
  onDelete?: (postId: string) => void;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({
  post,
  currentUserId,
  isAuthor,
  onLike,
  onReadMore,
  onEdit,
  onDelete
}) => {
  return (
    <motion.div 
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
          {isAuthor && (
            <div className="flex gap-2">
              {onEdit && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                  className="text-stone-400 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  title="Editar publicación"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                  className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  title="Eliminar publicación"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>
        
        <p className="font-outfit text-stone-600 leading-relaxed whitespace-pre-wrap line-clamp-3">
          {post.content}
        </p>
        
        <button 
          onClick={() => onReadMore(post)}
          className="text-stone-800 font-medium text-sm font-outfit self-start hover:underline"
        >
          Leer artículo completo →
        </button>
        
        <ReactionButton 
          likedBy={post.likedBy || []}
          userId={currentUserId}
          onLike={(type) => onLike(post.id, type)}
          size="sm"
        />
      </div>
    </motion.div>
  );
};
