import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:3000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => setUser(response.data))
      .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      username,
      email,
      password
    });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};