import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, LogOut, 
  UserCircle, Briefcase, Mail, Shield, MessageSquare 
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Safety check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Menu sidebar - PERBAIKAN: Dashboard sekarang punya roles!
  const menus = [
    { 
      path: user.role === 'manager' ? '/manager' : user.role === 'admin' ? '/admin' : '/staff', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      roles: ['manager', 'admin'] // FIX: Tambahkan ini agar menu Dashboard muncul
    },
    { path: 'documents', label: user.role === 'staff' ? 'Dokumen Saya' : 'Dokumen', icon: FileText, roles: ['staff', 'manager', 'admin'] },
    { path: 'users', label: 'Manajemen User', icon: UserCircle, roles: ['admin'] },
    { path: 'inbox', label: 'Pesan', icon: Mail, roles: ['staff'] },
    { path: 'inbox', label: 'Pesan', icon: MessageSquare, roles: ['manager', 'admin'] },
    { path: 'reports', label: 'Laporan Audit', icon: Shield, roles: ['manager'] },
  ];

  // Logika highlight sidebar
  const isActive = (menuPath) => {
    if (!menuPath) return false;
    if (menuPath.startsWith('/')) {
      return location.pathname === menuPath;
    }
    return location.pathname.endsWith(menuPath) || location.pathname.includes(`/${menuPath}`);
  };

  // Judul header dinamis
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/inbox')) return 'Pesan';
    if (path.includes('/documents')) return user.role === 'staff' ? 'Dokumen Saya' : 'Dokumen';
    if (path.includes('/users')) return 'Manajemen User';
    if (path.includes('/reports')) return 'Laporan Audit';
    return 'Dashboard';
  };

  // Filter menu
  const filteredMenus = menus.filter(menu => {
    if (!menu.roles || !user.role) return false;
    return menu.roles.includes(user.role);
  });

  return (
    <div className="flex h-screen bg-brand-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-brand-100 flex flex-col shadow-soft z-20">
        <div className="p-6 border-b border-brand-50">
          <h1 className="text-xl font-bold text-brand-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center text-white">
              <Briefcase size={18} />
            </div>
            LegalDocs
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredMenus.map((menu, index) => (
            <Link
              key={`${menu.path}-${index}`}
              to={menu.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive(menu.path)
                  ? 'bg-accent-50 text-accent-700 font-medium shadow-sm'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-900'
              }`}
            >
              <menu.icon size={20} className={isActive(menu.path) ? 'text-accent-600' : 'text-brand-400 group-hover:text-brand-600'} />
              {menu.label}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-brand-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
              <UserCircle size={24} />
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-brand-800 truncate">{user.name || 'User'}</p>
                {user.role && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                    user.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'manager' ? 'MGR' : user.role === 'admin' ? 'ADM' : 'STF'}
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-400 capitalize">{user.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-brand-100 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-brand-800">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-brand-50 text-brand-600 text-xs font-medium rounded-full border border-brand-100 text-right max-w-[300px]">
              Sistem Pengolahan Dokumen Legal dan Arsip Kontrak Perusahaan
            </span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}