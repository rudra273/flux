'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';
import { Home, LogIn, LogOut, User, Pin, PinOff } from 'lucide-react';

export default function SideNav() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
        setIsPinned(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      document.body.style.setProperty(
        '--sidebar-width', 
        isCollapsed ? '4rem' : '16rem'
      );
    } else {
      document.body.style.setProperty('--sidebar-width', '0px');
    }
  }, [isCollapsed, isMobile]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-20"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Floating mobile trigger - only visible when sidebar is collapsed */}
      {isMobile && isCollapsed && (
        <button
          onClick={toggleCollapse}
          className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-background border border-border shadow-lg md:hidden"
        >
          <User size={24} />
        </button>
      )}

      {/* Sidebar */}
      <nav
        className={`fixed top-0 h-full bg-background border-r border-border z-20 transition-all duration-300 
          ${isCollapsed ? (isMobile ? '-translate-x-full' : 'w-16') : 'w-64'} 
          ${!isPinned && !isMobile ? 'hover:w-64' : ''}
          ${isMobile ? 'w-64' : ''}
        `}
        onMouseEnter={() => !isPinned && !isMobile && setIsCollapsed(false)}
        onMouseLeave={() => !isPinned && !isMobile && setIsCollapsed(true)}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4">
            {/* Profile button inside nav for mobile - only visible when sidebar is open */}
            {isMobile && !isCollapsed ? (
              <button
                onClick={toggleCollapse}
                className="p-2 rounded-lg hover:bg-muted/50"
              >
                <User size={24} />
              </button>
            ) : null}
            
            <h1 className={`text-2xl font-bold whitespace-nowrap ${
              (isCollapsed && !isMobile) ? 'hidden' : 'block ml-2'
            }`}>
              Flux
            </h1>
            
            {/* Pin button - desktop only */}
            {!isMobile && (
              <button
                onClick={togglePin}
                className={`p-1 rounded hover:bg-muted/50 ${isCollapsed ? 'hidden' : 'block'}`}
                title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
              >
                {isPinned ? <Pin size={20} /> : <PinOff size={20} />}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-2 p-2">
              <li>
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-lg"
                  title="Home"
                >
                  <Home size={20} />
                  <span className={isCollapsed && !isMobile ? 'hidden' : 'block'}>Home</span>
                </Link>
              </li>
              {!isAuthenticated ? (
                <li>
                  <Link 
                    href="/auth/login" 
                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-lg"
                    title="Login"
                  >
                    <LogIn size={20} />
                    <span className={isCollapsed && !isMobile ? 'hidden' : 'block'}>Login</span>
                  </Link>
                </li>
              ) : (
                <li>
                  {/* <Link 
                    href="/profile" 
                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-lg"
                    title="Profile"
                  >
                    <User size={20} />
                    <span className={isCollapsed && !isMobile ? 'hidden' : 'block'}>Profile</span>
                  </Link> */}
                    <Link
                    href="/profile/my-profile"
                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-lg"
                    title="Profile"
                    >
                    <User size={20} />
                    <span className={isCollapsed && !isMobile ? 'hidden' : 'block'}>Profile</span>
                    </Link>
                </li>
              )}
            </ul>
          </div>

          {isAuthenticated && (
            <div className={`border-t border-border p-4 ${isCollapsed && !isMobile ? 'hidden' : 'block'}`}>
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">Logged in as:</span>
                <p className="font-medium">{user?.username}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 p-2 w-full hover:bg-muted/50 rounded-lg text-red-600 dark:text-red-400"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}