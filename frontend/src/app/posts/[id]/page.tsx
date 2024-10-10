// app/posts/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPost } from '../../../utils/postsApi';
import { ApiError } from '../../../utils/apiClient';
import PostCard from '../../../components/PostCard';
import { useAuth } from '../../../providers/AuthProvider';

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export default function PostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isLoading: authLoading } = useAuth();  // Removed isAuthenticated since it's unused
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!authLoading && id) {
      fetchPost(id as string);
    }
  }, [authLoading, id]);

  const fetchPost = async (postId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const fetchedPost = await getPost(postId);
      setPost(fetchedPost);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError(
        error instanceof ApiError
          ? error.message
          : 'Failed to fetch the post. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post && !error) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto my-8">
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : (
        post && (
          <div className="bg-background p-6 rounded-lg shadow-md">
            <PostCard post={post} />
          </div>
        )
      )}
    </div>
  );
}
