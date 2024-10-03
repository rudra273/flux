const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

// Fetch all posts without requiring authentication
export const getAllPosts = async () => {
  console.log('Fetching all posts');
  const response = await fetch(`${API_URL}/posts`, {
    headers: {
      'Content-Type': 'application/json', // Keep this header, but omit Authorization
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

export const getPost = async (id: number) => {
  console.log(`Fetching post with id: ${id}`);
  const response = await fetch(`${API_URL}/posts/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  return response.json();
};

export const createPost = async (postData: { title: string; content: string }) => {
    console.log('Creating new post:', postData);
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    return response.json();
  };

export const deletePost = async (id: number) => {
  console.log(`Deleting post with id: ${id}`);
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
  return response.json();
};

