import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { Briefcase, Lock, Eye, EyeOff, User, Mail } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
    // Role dihapus dari state form, nanti di-hardcode jadi 'staff' saat kirim
  });
  
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password tidak cocok!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }

    setLoading(true);

    try {
      // ✅ REGISTER VIA API (Role otomatis diset 'staff')
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'staff' // <--- HARDCODE JADI STAFF
      });

      toast.success("Registrasi Staff berhasil! Silakan login.");
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || "Registrasi gagal. Email mungkin sudah digunakan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-brand-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-accent-600 p-6 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 backdrop-blur-sm border border-white/30">
              <Briefcase size={28} />
            </div>
            <h2 className="text-xl font-bold">Daftar Akun Staff</h2>
            <p className="text-white/80 mt-1 text-xs">LegalDocs System</p>
          </div>
        </div>

        {/* Form Register */}
        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label-text">Nama Lengkap</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  className="input pl-10"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
              </div>
            </div>

            <div>
              <label className="label-text">Email Perusahaan</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  className="input pl-10"
                  placeholder="nama@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
              </div>
            </div>
            
            {/* ❌ DROPDOWN ROLE DIHAPUS DARI SINI */}

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="input pl-10 pr-10"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={handleChange}
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

            <div>
              <label className="label-text">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="confirmPassword"
                  className="input pl-10"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-sm font-semibold shadow-lg shadow-accent-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Mendaftar...
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Link ke Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-accent-600 font-semibold hover:text-accent-700 underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}