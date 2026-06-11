import { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [messages, setMessages] = useState([]);

  // Cek token saat aplikasi dimulai
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      fetchAllData(); // Ambil data dokumen & pesan dari DB
    }
    setLoading(false);
  }, []);

  // Fungsi ambil semua data dari backend
  const fetchAllData = async () => {
    try {
      const [docsRes, msgRes] = await Promise.all([
        api.get('/documents'),
        api.get('/messages')
      ]);
      setDocs(docsRes.data);
      setMessages(msgRes.data);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };

  // Fungsi Login ke Backend
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      fetchAllData();
      return true;
    } catch (err) {
      console.error("Login gagal:", err.response?.data || err.message);
      return false;
    }
  };

  // Fungsi Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDocs([]);
    setMessages([]);
  };

  // Cek Hak Akses (RBAC)
  const canAccess = (requiredRole) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === requiredRole;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, docs, setDocs, messages, setMessages, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);