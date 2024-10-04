// components/SideNav.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';
import { Home, LogIn, LogOut, User } from 'lucide-react';

export default function SideNav() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <div className="flex items-center justify-center mb-8">
        <h1 className="text-2xl font-bold">Flux</h1>
      </div>

      <div className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link 
              href="/" 
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
          </li>
          {!isAuthenticated ? (
            <li>
              <Link 
                href="/auth/login" 
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <LogIn size={20} />
                <span>Login</span>
              </Link>
            </li>
          ) : (
            <li>
              <Link 
                href="/profile" 
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <User size={20} />
                <span>Profile</span>
              </Link>
            </li>
          )}
        </ul>
      </div>

      {isAuthenticated && (
        <div className="border-t border-gray-200 pt-4">
          <div className="mb-4 px-2">
            <span className="text-sm text-gray-600">Logged in as:</span>
            <p className="font-medium">{user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 p-2 w-full hover:bg-gray-100 rounded-lg text-red-600"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}