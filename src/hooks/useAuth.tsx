
import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and verify it
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }  };

  // Helper function to sync localStorage saved funds to database
  const syncLocalSavedFunds = async () => {
    try {
      const localSavedFunds = JSON.parse(localStorage.getItem('savedFunds') || '[]');
      if (localSavedFunds.length > 0) {
        // Fetch fund details for each saved fund code and save to database
        for (const schemeCode of localSavedFunds) {
          try {
            // Fetch fund details from the external API
            const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
            const fundData = await response.json();
            
            if (fundData.status === 'SUCCESS' && fundData.meta) {
              await userApi.saveFund({
                schemeCode: fundData.meta.scheme_code,
                schemeName: fundData.meta.scheme_name,
                fundHouse: fundData.meta.fund_house
              });
            }
          } catch (error) {
            console.error(`Error syncing fund ${schemeCode}:`, error);
          }
        }
        // Clear localStorage after syncing
        localStorage.removeItem('savedFunds');
      }
    } catch (error) {
      console.error('Error syncing local saved funds:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // If there are validation errors, format them nicely
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.message).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Login failed');      }

      setUser(data.user);
      localStorage.setItem('token', data.token);
      
      // Sync local saved funds to database
      await syncLocalSavedFunds();
    } catch (error) {
      throw error;
    }
  };  const register = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // If there are validation errors, format them nicely
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.message).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Registration failed');      }

      setUser(data.user);
      localStorage.setItem('token', data.token);
      
      // Sync local saved funds to database
      await syncLocalSavedFunds();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
