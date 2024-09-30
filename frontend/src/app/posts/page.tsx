'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllPosts, createPost } from '../../utils/api';
import PostCard from '../../components/PostCard';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    console.log('Posts page mounted');
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await getAllPosts();
      console.log('Fetched posts:', fetchedPosts);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting new post:', { title, content });
    try {
      await createPost({ title, content });
      console.log('Post created successfully');
      setTitle('');
      setContent('');
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Posts</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-2 mb-4 border rounded"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Post
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <PostCard post={post} />
          </Link>
        ))}
      </div>
    </div>
  );
}