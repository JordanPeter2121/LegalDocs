import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password wajib diisi!");
      return;
    }
    
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      toast.success(`Selamat datang, ${storedUser.name}!`);
      
      if (storedUser.role === 'admin') navigate('/admin');
      else if (storedUser.role === 'manager') navigate('/manager');
      else navigate('/staff');
    } else {
      toast.error("Email atau password salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-brand-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-accent-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <Briefcase size={32} />
            </div>
            <h2 className="text-2xl font-bold">LegalDocs System</h2>
            <p className="text-white/80 mt-1 text-sm">Sistem Pengolahan Dokumen Legal & Arsip</p>
          </div>
        </div>

        {/* Form Login */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label-text">Email Perusahaan</label>
              <div className="relative">
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="nama@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
              </div>
            </div>
            
            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-sm font-semibold shadow-lg shadow-accent-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Memverifikasi...
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          {/* Link ke Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-600">
              Belum punya akun?{' '}
              <Link to="/register" className="text-accent-600 font-semibold hover:text-accent-700 underline">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}