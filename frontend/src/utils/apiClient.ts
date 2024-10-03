import { refreshToken } from './authApi';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const apiClient = async (
  endpoint: string,
  options: ApiOptions = {}
) => {
  const { requiresAuth = true, ...fetchOptions } = options;
  const url = `${API_URL}${endpoint}`;

  if (requiresAuth) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new ApiError(401, 'No access token found');
    }
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  try {
    const response = await fetch(url, fetchOptions);

    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401 && requiresAuth) {
      try {
        // Attempt to refresh the token
        const refreshResult = await refreshToken();
        
        // Retry the original request with the new token
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Authorization': `Bearer ${refreshResult.access_token}`
        };
        
        const retryResponse = await fetch(url, fetchOptions);
        
        if (!retryResponse.ok) {
          throw new ApiError(retryResponse.status, 'Request failed after token refresh');
        }
        
        return retryResponse.json();
      } catch (refreshError) {
        // If refresh fails, throw authentication error
        throw new ApiError(401, 'Authentication failed');
      }
    }

    if (!response.ok) {
      throw new ApiError(response.status, 'Request failed');
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error');
  }
};

