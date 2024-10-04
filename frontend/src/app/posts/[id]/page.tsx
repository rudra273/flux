// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import { getPost } from '../../../utils/postsApi';

// export default function PostPage() {
//   const [post, setPost] = useState(null);
//   const params = useParams();
//   const id = params.id;

//   useEffect(() => {
//     console.log(`Post page mounted for id: ${id}`);
//     fetchPost();
//   }, [id]);

//   const fetchPost = async () => {
//     try {
//       const fetchedPost = await getPost(Number(id));
//       console.log('Fetched post:', fetchedPost);
//       setPost(fetchedPost);
//     } catch (error) {
//       console.error('Error fetching post:', error);
//     }
//   };

//   if (!post) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
//       <p className="text-gray-700">{post.content}</p>
//     </div>
//   );
// }


// app/posts/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPost, deletePost } from '../../../utils/postsApi';
import { useAuth } from '../../../providers/AuthProvider';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  created_at: string;
}

export default function PostDetail({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    setIsLoading(true);
    setError('');

    try {
      const fetchedPost = await getPost(params.id);
      setPost(fetchedPost);
    } catch (error: any) {
      console.error('Error fetching post:', error);
      setError('Failed to fetch post. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deletePost(params.id);
      router.push('/posts');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Post not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/posts')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                Back to Posts
              </button>
              {isAuthenticated && user?.id === post.author.id && (
                <>
                  <button
                    onClick={() => router.push(`/posts/${post.id}/edit`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="mb-6 text-gray-600">
            <span>By {post.author.username}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className="prose max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-800">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}