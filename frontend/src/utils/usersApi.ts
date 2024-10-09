import { apiClient } from './apiClient';

export interface Profile {
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  dob: string | null;
  username: string;
  email: string;
  recent_posts: Post[];
}

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  username: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  dob?: string;
}

export const getCurrentUser = async () => {
  try {
    return await apiClient('/users/me', { requiresAuth: true });
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

export const getProfile = async (username: string) => {
  try {
    return await apiClient(`/users/profile/${username}`, { requiresAuth: false });
  } catch (error) {
    console.error('Failed to get profile:', error);
    throw error;
  }
};

export const updateProfile = async (username: string, data: ProfileUpdateData) => {
  try {
    return await apiClient(`/users/profile/${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};