// utils/usersApi.ts
import { apiClient } from './apiClient';

export const getCurrentUser = async () => {
  try {
    return await apiClient('/users/me', { requiresAuth: true });
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

