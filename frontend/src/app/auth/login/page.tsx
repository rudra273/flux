// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { login } from '../../../utils/authApi';

// export default function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const data = await login({ username, password });
//       localStorage.setItem('accessToken', data.access_token);
//       router.push('/posts');
//     } catch (err: any) {
//       setError(err.response?.data?.detail || 'An error occurred during login');
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Login</h1>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       <form onSubmit={handleSubmit} className="max-w-md">
//         <input
//           type="text"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           placeholder="Username"
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />
//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />
//         <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }

// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../../utils/authApi';
import { useAuth } from '../../../providers/AuthProvider';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login: authLogin, checkAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Perform login
      const data = await login({ username, password });
      
      // Update auth state
      await checkAuth();
      
      // Navigate to posts page
      router.push('/posts');
      router.refresh(); // Force a refresh of the client-side router cache
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Login to Your Account</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}