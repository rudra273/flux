import React, { useState } from 'react';
import Link from 'next/link';
import { User, Clock, MoreVertical } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { deletePost } from '../utils/postsApi';

interface Post {
  id: number;
  title?: string;
  content: string;
  username: string;      
  created_at: string;     
  updated_at: string;
}

interface PostCardProps {
  post: Post;
  onPostDeleted: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();

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

  const handleDelete = async () => {
    try {
      await deletePost(post.id.toString());
      onPostDeleted();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
    <div className="bg-background border rounded-lg p-6 hover:shadow-lg transition-all duration-300 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-muted/30 p-2 rounded-full">
            <User size={18} className="text-muted-foreground" />
          </div>
          <Link href={`/profile/${post.username}`} className="hover:underline">
            <span className="font-medium text-foreground">{post.username}</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>{getTimeAgo(post.created_at)}</span>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-full hover:bg-muted/20"
            >
              <MoreVertical size={18} className="text-muted-foreground" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <Link 
                  href={`/posts/${post.id}`} 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
                {user?.username === post.username && (
                  <>
                    <Link 
                      href={`/posts/${post.id}/edit`} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Update
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        {post.title && <h2 className="text-xl font-semibold mb-2 text-foreground">{post.title}</h2>}
        <p className="text-muted-foreground line-clamp-3">{post.content}</p>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this post?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
};

export default PostCard;