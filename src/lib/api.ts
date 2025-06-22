const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// User API functions
export const userApi = {
  // Get saved funds
  getSavedFunds: async () => {
    const response = await fetch(`${API_BASE_URL}/user/saved-funds`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Save a fund
  saveFund: async (fundData: { schemeCode: string; schemeName: string; fundHouse?: string }) => {
    const response = await fetch(`${API_BASE_URL}/user/save-fund`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(fundData)
    });
    return handleResponse(response);
  },

  // Remove a saved fund
  removeSavedFund: async (schemeCode: string) => {
    const response = await fetch(`${API_BASE_URL}/user/saved-fund/${schemeCode}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Check if fund is saved
  isFundSaved: async (schemeCode: string) => {
    const response = await fetch(`${API_BASE_URL}/user/is-saved/${schemeCode}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Auth API functions
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  register: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  verifyToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default { userApi, authApi };
