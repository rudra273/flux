'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPost } from '../../../utils/postsApi';

export default function PostPage() {
  const [post, setPost] = useState(null);
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    console.log(`Post page mounted for id: ${id}`);
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const fetchedPost = await getPost(Number(id));
      console.log('Fetched post:', fetchedPost);
      setPost(fetchedPost);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700">{post.content}</p>
    </div>
  );
}