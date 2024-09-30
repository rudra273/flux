'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    console.log('Home page mounted');
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Flux</h1>
      <p className="text-xl mb-8">Your platform for sharing and discovering posts</p>
      <Link href="/posts" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        View Posts
      </Link>
    </main>
  );
}