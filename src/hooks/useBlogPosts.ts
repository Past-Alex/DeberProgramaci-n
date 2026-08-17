import { useState, useEffect, useCallback } from 'react';
import { BlogPost, ReactionType } from '../types';
import { createClient } from '@/utils/supabase/client';

export function useBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
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
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = async (post: Partial<BlogPost>) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        content: post.content,
        author_id: post.author_id,
        author_name: post.authorName,
        date: post.date,
        likes: 0,
        liked_by: [],
        comments: [],
        image_url: post.imageUrl
      })
      .select()
      .single();

    if (data && !error) {
      setBlogPosts([{
        id: data.id,
        title: data.title,
        content: data.content,
        author_id: data.author_id,
        authorName: data.author_name,
        date: data.date,
        likes: data.likes,
        imageUrl: data.image_url,
        likedBy: data.liked_by || [],
        comments: data.comments || []
      }, ...blogPosts]);
    }
    return data;
  };

  const updatePost = async (postId: string, updates: Partial<BlogPost>) => {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.content) dbUpdates.content = updates.content;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    
    await supabase.from('blog_posts').update(dbUpdates).eq('id', postId);
    
    setBlogPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
  };

  const deletePost = async (postId: string) => {
    await supabase.from('blog_posts').delete().eq('id', postId);
    setBlogPosts(prev => prev.filter(p => p.id !== postId));
  };

  const likePost = async (postId: string, userId: string, reactionType: ReactionType) => {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    const reactionString = `${userId}:${reactionType}`;
    let newLikedBy = [...(post.likedBy || [])];
    
    const existingIndex = newLikedBy.findIndex(r => r.startsWith(`${userId}:`) || r === userId);
    
    if (existingIndex !== -1) {
      const existingReaction = newLikedBy[existingIndex].includes(':') 
        ? newLikedBy[existingIndex].split(':')[1] 
        : 'like';
        
      if (existingReaction === reactionType) {
        newLikedBy.splice(existingIndex, 1);
      } else {
        newLikedBy[existingIndex] = reactionString;
      }
    } else {
      newLikedBy.push(reactionString);
    }
    
    await supabase.from('blog_posts').update({ liked_by: newLikedBy }).eq('id', postId);
    setBlogPosts(prev => prev.map(p => p.id === postId ? { ...p, likedBy: newLikedBy } : p));
  };

  const addComment = async (postId: string, comment: any) => {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    const newComments = [...(post.comments || []), comment];
    await supabase.from('blog_posts').update({ comments: newComments }).eq('id', postId);
    setBlogPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: newComments } : p));
  };

  const deleteComment = async (postId: string, commentId: string) => {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    const newComments = (post.comments || []).filter(c => c.id !== commentId);
    await supabase.from('blog_posts').update({ comments: newComments }).eq('id', postId);
    setBlogPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: newComments } : p));
  };

  return {
    blogPosts,
    isLoading,
    addPost,
    updatePost,
    deletePost,
    likePost,
    addComment,
    deleteComment
  };
}
