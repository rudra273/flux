// app/posts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllPosts } from '../../utils/postsApi';
import { useAuth } from '../../providers/AuthProvider';
import PostCard from '../../components/PostCard';
import CreatePost from '../../components/CreatePost';
import { ApiError } from '../../utils/apiClient';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  created_at: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [authLoading]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const fetchedPosts = await getAllPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(
        error instanceof ApiError 
          ? error.message 
          : 'Failed to fetch posts. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <p className="text-gray-600 mt-2">
          Discover and share interesting posts with the community
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {isAuthenticated && <CreatePost onPostCreated={fetchPosts} />}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">
                {isAuthenticated 
                  ? 'No posts yet. Be the first to create one!' 
                  : 'No posts yet. Login to create the first post!'}
              </p>
              {!isAuthenticated && (
                <Link 
                  href="/auth/login"
                  className="inline-block mt-4 text-blue-500 hover:text-blue-600 font-medium"
                >
                  Go to Login
                </Link>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/posts/${post.id}`}
                className="block transform transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <PostCard post={post} />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}