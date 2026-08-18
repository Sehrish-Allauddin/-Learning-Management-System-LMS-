export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchApi = async (url, options = {}) => {
  const token = localStorage.getItem('LMS_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
