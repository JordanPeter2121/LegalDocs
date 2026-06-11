import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { Users, FileText, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Slide Show
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchData = async () => {
    try {
      const [usersRes, docsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/documents')
      ]);
      setUsers(usersRes.data);
      setDocs(docsRes.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto slide setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalUsers: users.length,
    staff: users.filter(u => u.role === 'staff').length,
    manager: users.filter(u => u.role === 'manager').length,
    admin: users.filter(u => u.role === 'admin').length,
    totalDocs: docs.length,
    activeDocs: docs.filter(d => d.status === 'aktif').length
  };

  // Data Slide Show
  const slides = [
    {
      title: "Manajemen Dokumen Legal",
      subtitle: "Kelola semua dokumen perusahaan dalam satu sistem terintegrasi",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      title: "Kolaborasi Tim Efektif",
      subtitle: "Fitur chat real-time antara Staff, Manager, dan Admin",
      gradient: "from-purple-500 to-purple-700",
    },
    {
      title: "Monitoring Status Dokumen",
      subtitle: "Pantau masa berlaku dan status dokumen secara otomatis",
      gradient: "from-green-500 to-green-700",
    },
    {
      title: "Export & Laporan Audit",
      subtitle: "Generate laporan dokumen ke format Excel dan PDF",
      gradient: "from-orange-500 to-orange-700",
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-brand-900">Selamat Datang, {user.name}! 👋</h2>
          <p className="text-brand-500 mt-2">Ringkasan sistem LegalDocs hari ini.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/users')}
          className="btn-primary flex items-center gap-2"
        >
          <Users size={18} /> Kelola User
        </button>
      </div>

      {/* SLIDE SHOW */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-lg">
        {/* Slide Content */}
        <div className={`bg-gradient-to-r ${slides[currentSlide].gradient} p-8 text-white transition-all duration-500`}>
          <div className="flex items-center gap-6">
            <div className="text-6xl">{slides[currentSlide].icon}</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{slides[currentSlide].title}</h3>
              <p className="text-white/90 text-sm">{slides[currentSlide].subtitle}</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STATS GRID 2x2 - LEBIH KECIL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Total Users */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-blue-600 font-semibold text-sm mb-1">Total Pengguna</p>
            <h3 className="text-2xl font-bold text-brand-900">{loading ? '-' : stats.totalUsers}</h3>
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
            <Users size={20} />
          </div>
        </div>

        {/* Card 2: Total Dokumen */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-purple-600 font-semibold text-sm mb-1">Total Dokumen</p>
            <h3 className="text-2xl font-bold text-brand-900">{loading ? '-' : stats.totalDocs}</h3>
          </div>
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white">
            <FileText size={20} />
          </div>
        </div>

        {/* Card 3: Dokumen Aktif */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-green-600 font-semibold text-sm mb-1">Dokumen Aktif</p>
            <h3 className="text-2xl font-bold text-brand-900">{loading ? '-' : stats.activeDocs}</h3>
          </div>
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
            <CheckCircle size={20} />
          </div>
        </div>

        {/* Card 4: Role Breakdown */}
        <div className="card bg-white border-brand-100 p-4 flex flex-col justify-center hover:shadow-md transition-shadow">
          <p className="text-brand-500 font-semibold text-sm mb-3">Komposisi Pengguna</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-600">Staff</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-brand-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${stats.totalUsers > 0 ? (stats.staff / stats.totalUsers) * 100 : 0}%` }}></div>
                </div>
                <span className="text-xs font-bold text-brand-900 w-3">{stats.staff}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-600">Manager</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-brand-100 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${stats.totalUsers > 0 ? (stats.manager / stats.totalUsers) * 100 : 0}%` }}></div>
                </div>
                <span className="text-xs font-bold text-brand-900 w-3">{stats.manager}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-600">Admin</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-brand-100 rounded-full h-1.5">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${stats.totalUsers > 0 ? (stats.admin / stats.totalUsers) * 100 : 0}%` }}></div>
                </div>
                <span className="text-xs font-bold text-brand-900 w-3">{stats.admin}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}