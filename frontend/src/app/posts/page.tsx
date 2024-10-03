// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { getAllPosts } from '../../utils/postsApi';
// import { logout } from '../../utils/authApi';
// import PostCard from '../../components/PostCard';
// import CreatePost from '../../components/CreatePost';

// export default function Posts() {
//   const [posts, setPosts] = useState([]);
//   const [error, setError] = useState('');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     checkAuthAndFetchPosts();
//   }, []);

//   const checkAuthAndFetchPosts = async () => {
//     const token = localStorage.getItem('accessToken');
//     setIsLoggedIn(!!token);
    
//     if (!token) {
//       router.push('/auth/login');
//     } else {
//       fetchPosts();
//     }
//   };

//   const fetchPosts = async () => {
//     try {
//       const fetchedPosts = await getAllPosts();
//       setPosts(fetchedPosts);
//     } catch (error) {
//       console.error('Error fetching posts:', error);
//       setError('Failed to fetch posts');
      
//       // If the error is due to authentication, redirect to login
//       if (error.message === 'Unauthorized') {
//         handleLogout();
//       }
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       setIsLoggedIn(false);
//       router.push('/auth/login');
//     } catch (error) {
//       console.error('Error during logout:', error);
//       // Still redirect even if the logout API call fails
//       router.push('/auth/login');
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">My Posts</h1>
//         {isLoggedIn && (
//           <button 
//             onClick={handleLogout} 
//             className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
//           >
//             Logout
//           </button>
//         )}
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}
      
//       {isLoggedIn && <CreatePost onPostCreated={fetchPosts} />}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {posts.map((post) => (
//           <Link key={post.id} href={`/posts/${post.id}`}>
//             <PostCard post={post} />
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllPosts } from '../../utils/postsApi';
import { logout } from '../../utils/authApi';
import { useAuth } from '../../providers/AuthProvider';
import PostCard from '../../components/PostCard';
import CreatePost from '../../components/CreatePost';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      fetchPosts();
    }
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const fetchedPosts = await getAllPosts();
      setPosts(fetchedPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      
      if (error.status === 401) {
        // Try to refresh authentication
        try {
          await checkAuth();
          // Retry fetching posts after successful auth refresh
          const fetchedPosts = await getAllPosts();
          setPosts(fetchedPosts);
        } catch (authError) {
          setError('Your session has expired. Please login again.');
          handleLogout();
        }
      } else {
        setError('Failed to fetch posts. Please try again later.');
      }
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
      // Still redirect even if the logout API call fails
      router.push('/auth/login');
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting to login
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <button 
          onClick={handleLogout} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <CreatePost onPostCreated={fetchPosts} />

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No posts found. Create your first post above!
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
