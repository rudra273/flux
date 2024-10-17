'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPost, deletePost } from '@/utils/postsApi';
import { User, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

interface Post {
  id: number;
  title?: string;
  content: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const fetchedPost = await getPost(params.id);
        setPost(fetchedPost);
      } catch (err) {
        setError('Failed to load post');
        console.error(err);
      }
    };

    fetchPost();
  }, [params.id]);

  const handleDelete = async () => {
    try {
      await deletePost(params.id);
      router.push('/');
    } catch (err) {
      setError('Failed to delete post');
      console.error(err);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMilliseconds = now.getTime() - postDate.getTime();
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
   
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours === 1) {
      return '1 hour ago';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return postDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!post) {
    return <div>Loading...</div>;
  }

  const isAuthor = user && user.username === post.username;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-muted/30 p-2 rounded-full">
            <User size={18} className="text-muted-foreground" />
          </div>
          <Link href={`/profile/${post.username}`} className="hover:underline">
            <span className="font-medium text-foreground">{post.username}</span>
          </Link>
        </div>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Clock size={16} />
          <span>{getTimeAgo(post.created_at)}</span>
        </div>
      </div>

      {post.title && <h1 className="text-3xl font-bold mb-4">{post.title}</h1>}
      <p className="text-lg mb-6">{post.content}</p>

      {isAuthor && (
        <div className="flex space-x-4 mt-4">
          <Link
            href={`/posts/${post.id}/edit`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this post?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}