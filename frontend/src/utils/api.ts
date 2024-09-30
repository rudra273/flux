const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getAllPosts = async () => {
  console.log('Fetching all posts');
  const response = await fetch(`${API_URL}/posts`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

export const getPost = async (id: number) => {
  console.log(`Fetching post with id: ${id}`);
  const response = await fetch(`${API_URL}/posts/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  return response.json();
};

export const createPost = async (postData: { title: string; content: string }) => {
  console.log('Creating new post:', postData);
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
  if (!response.ok) {
    throw new Error('Failed to create post');
  }
  return response.json();
};