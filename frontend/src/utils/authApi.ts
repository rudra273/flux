// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// export const register = async (userData: { username: string; email: string; password: string }) => {
//     const response = await fetch(`${API_URL}/users/register`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//     });
//     if (!response.ok) {
//         throw new Error('Failed to register');
//     }
//     return response.json();
// };

// export const login = async (credentials: { username: string; password: string }) => {
//     const response = await fetch(`${API_URL}/users/token`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams(credentials),
//     });
//     if (!response.ok) {
//         throw new Error('Failed to login');
//     }

//     const data = await response.json();
//     // Store both tokens
//     localStorage.setItem('accessToken', data.access_token);
//     localStorage.setItem('refreshToken', data.refresh_token);

//     return data;
// };

// export const refreshToken = async () => {
//     const refreshToken = localStorage.getItem('refreshToken');
//     if (!refreshToken) {
//         throw new Error('No refresh token found');
//     }

//     const response = await fetch(`${API_URL}/users/refresh`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ refresh_token: refreshToken }),
//     });

//     if (!response.ok) {
//         // If refresh fails, logout the user
//         logout();
//         throw new Error('Failed to refresh token');
//     }

//     const data = await response.json();
//     localStorage.setItem('accessToken', data.access_token);
//     localStorage.setItem('refreshToken', data.refresh_token);
//     return data;
// };

// export const logout = async () => {
//     const refreshToken = localStorage.getItem('refreshToken');
//     if (refreshToken) {
//         try {
//             await fetch(`${API_URL}/users/logout`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ refresh_token: refreshToken }),
//             });
//         } catch (error) {
//             console.error('Error during logout:', error);
//         }
//     }
//     // Clear tokens regardless of logout API success
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
// };

// export const getCurrentUser = async () => {
//     let token = localStorage.getItem('accessToken');
//     if (!token) {
//         throw new Error('No access token found');
//     }

//     try {
//         const response = await fetch(`${API_URL}/users/me`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//             },
//         });

//         if (response.status === 401) {
//             // Token expired, try to refresh
//             await refreshToken();
//             token = localStorage.getItem('accessToken');
//             // Retry the request with new token
//             const newResponse = await fetch(`${API_URL}/users/me`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });
//             if (!newResponse.ok) {
//                 throw new Error('Failed to get current user');
//             }
//             return newResponse.json();
//         }

//         if (!response.ok) {
//             throw new Error('Failed to get current user');
//         }

//         return response.json();
//     } catch (error) {
//         throw error;
//     }
// };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export const getCurrentUser = async () => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token found');
  }

  try {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

