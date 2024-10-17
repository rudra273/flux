// utils/postsApi.ts
import { apiClient } from './apiClient';

export const getAllPosts = async () => {
  return apiClient('/posts', { requiresAuth: false });
};

export const getPost = async (id: string) => {
  return apiClient(`/posts/${id}`, { requiresAuth: false });
};

export const createPost = async (postData: { title?: string; content: string }) => {
  return apiClient('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
    requiresAuth: true
  });
};

export const updatePost = async (id: string, postData: { title?: string; content?: string }) => {
  return apiClient(`/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
    requiresAuth: true
  });
};

export const deletePost = async (id: string) => {
  return apiClient(`/posts/${id}`, {
    method: 'DELETE',
    requiresAuth: true
  });
};