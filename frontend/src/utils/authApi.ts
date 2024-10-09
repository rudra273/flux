
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

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

export const login = async (credentials: { username: string; password: string }): Promise<AuthTokens> => {
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
  localStorage.setItem('accessToken', data.access_token);
  localStorage.setItem('refreshToken', data.refresh_token);

  return data;
};

export const refreshToken = async (): Promise<AuthTokens> => {
  const currentRefreshToken = localStorage.getItem('refreshToken');
  
  if (!currentRefreshToken) {
    throw new Error('No refresh token found');
  }

  try {
    const response = await fetch(`${API_URL}/users/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: currentRefreshToken }),
    });

    if (!response.ok) {
      // Clear tokens if refresh fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    
    return data;
  } catch (error) {
    // Clear tokens on error
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (refreshToken) {
    try {
      const response = await fetch(`${API_URL}/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        console.error('Error during logout API call');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Clear tokens regardless of logout API success
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};


