const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const register = async (userData: { username: string; email: string; password: string }) => {
  const response = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Failed to register');
  }
  return response.json();
};

export const login = async (credentials: { username: string; password: string }) => {
  const response = await fetch(`${API_URL}/users/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(credentials),
  });
  if (!response.ok) {
    throw new Error('Failed to login');
  }

  const data = await response.json();
  
  // Store the access token in localStorage
  localStorage.setItem('accessToken', data.access_token);

  return data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No access token found');
  }
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to get current user');
  }
  return response.json();
};
