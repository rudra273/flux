// 'use client';

// import { useState } from 'react';
// import { createPost } from '../utils/postsApi';

// interface CreatePostProps {
//   onPostCreated: () => void;
// }

// export default function CreatePost({ onPostCreated }: CreatePostProps) {
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await createPost({ title, content });
//       setTitle('');
//       setContent('');
//       setError('');
//       onPostCreated();
//     } catch (error) {
//       console.error('Error creating post:', error);
//       setError('Failed to create post');
//     }
//   };

//   return (
//     <div className="mb-8 bg-white p-6 rounded-lg shadow">
//       <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
      
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
//             Title
//           </label>
//           <input
//             id="title"
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="Enter post title"
//             className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
//             required
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
//             Content
//           </label>
//           <textarea
//             id="content"
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             placeholder="Enter post content"
//             className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
//             required
//           />
//         </div>
//         <button 
//           type="submit" 
//           className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           Create Post
//         </button>
//       </form>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from '../utils/postsApi';
import { useAuth } from '../providers/AuthProvider';

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { checkAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createPost({ title, content });
      setTitle('');
      setContent('');
      onPostCreated();
    } catch (error: any) {
      if (error.status === 401) {
        // Try to refresh authentication
        try {
          await checkAuth();
          // Retry the post creation after successful auth refresh
          await createPost({ title, content });
          setTitle('');
          setContent('');
          onPostCreated();
        } catch (authError) {
          // If auth refresh fails, redirect to login
          router.push('/auth/login');
        }
      } else {
        setError(error.message || 'Failed to create post');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded mb-4 border border-red-200">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter post content"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            required
            disabled={isSubmitting}
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Post...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}

