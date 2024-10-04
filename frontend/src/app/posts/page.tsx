// app/posts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllPosts } from '../../utils/postsApi';
import { logout } from '../../utils/authApi';
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
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

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
      setError(error instanceof ApiError ? error.message : 'Failed to fetch posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/auth/login');
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span>Welcome, {user?.username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Login to Create Posts
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isAuthenticated && <CreatePost onPostCreated={fetchPosts} />}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No posts found. {isAuthenticated ? 'Create your first post above!' : 'Login to create a post!'}
            </div>
          ) : (
            posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <PostCard post={post} />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}