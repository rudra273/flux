// utils/postsApi.ts
import { apiClient } from './apiClient';

export const getAllPosts = async () => {
  return apiClient('/posts', { requiresAuth: false });  // No auth required
};

export const getPost = async (id: string) => {
  return apiClient(`/posts/${id}`, { requiresAuth: false });  // No auth required
};

export const createPost = async (postData: { title: string; content: string }) => {
  return apiClient('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
    requiresAuth: true  // Requires auth for creating a post
  });
};

