import { refreshToken } from './authApi';
import { BACKEND_API_URL } from '@/constants';


// const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = BACKEND_API_URL;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorBody.detail || response.statusText);
  }
  return response.json();
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; // Assume token is expired if we can't parse it
  }
}

async function getValidToken(): Promise<string> {
  let token = localStorage.getItem('accessToken');
  
  if (!token || isTokenExpired(token)) {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      throw new ApiError(401, 'No refresh token found');
    }

    try {
      const tokens = await refreshToken();
      localStorage.setItem('accessToken', tokens.access_token);
      localStorage.setItem('refreshToken', tokens.refresh_token);
      token = tokens.access_token;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new ApiError(401, 'Failed to refresh token');
    }
  }

  return token;
}

export async function apiClient(endpoint: string, options: ApiOptions = {}) {
  const { requiresAuth = false, ...fetchOptions } = options;
  const url = `${API_URL}${endpoint}`;

  if (requiresAuth) {
    try {
      const token = await getValidToken();
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      throw error; // Re-throw the error if we couldn't get a valid token
    }
  }

  try {
    const response = await fetch(url, fetchOptions);
    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error');
  }
}