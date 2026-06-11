import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { MessageSquare, Search, Plus, X, User } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-toastify';

export default function UniversalInbox() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk modal "Pesan Baru"
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      const validConversations = res.data.filter(conv => conv.last_message_content);
      setConversations(validConversations);
    } catch (error) {
      console.error("Gagal ambil percakapan:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available users untuk "Pesan Baru"
  const fetchAvailableUsers = async () => {
    try {
      let allowedRoles = [];
      if (user.role === 'admin') {
        allowedRoles = ['manager'];
      } else if (user.role === 'staff') {
        allowedRoles = ['manager'];
      } else if (user.role === 'manager') {
        allowedRoles = ['admin', 'staff'];
      }
      
      const res = await api.get(`/admin/users`);
      const filteredUsers = res.data.filter(u => 
        allowedRoles.includes(u.role) && u.id !== user.id
      );
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error("Gagal ambil daftar user:", error);
      toast.error("Gagal memuat daftar pengguna");
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const formatTime = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    if (isToday(dateObj)) return format(dateObj, 'HH:mm');
    if (isYesterday(dateObj)) return 'Kemarin';
    return format(dateObj, 'dd/MM/yy');
  };

  const filteredConversations = conversations.filter(conv => 
    conv.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.doc_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenChat = (userId, docId) => {
    const basePath = location.pathname.split('/').filter(Boolean)[0];
    const chatPath = `/${basePath}/chat/${userId}${docId ? `?doc=${docId}` : ''}`;
    navigate(chatPath);
  };

  const handleStartNewChat = (selectedUser) => {
    const basePath = location.pathname.split('/').filter(Boolean)[0];
    navigate(`/${basePath}/chat/${selectedUser.id}`);
    setShowNewMessageModal(false);
  };

  const filteredUsers = availableUsers.filter(u => 
    u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-80px)] flex">
      {/* KOLOM KIRI: List Percakapan + Tombol Pesan Baru */}
      <div className="w-96 bg-white border-r border-brand-200 flex flex-col">
        
        {/* Header dengan Tombol Pesan Baru */}
        <div className="p-4 border-b border-brand-200 bg-brand-50">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-brand-900">Pesan</h2>
            <button
              onClick={() => {
                fetchAvailableUsers();
                setShowNewMessageModal(true);
              }}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <Plus size={14} /> Pesan Baru
            </button>
          </div>
          <p className="text-sm text-brand-500">
            {conversations.length === 0 ? 'Belum ada percakapan' : `${conversations.length} percakapan`}
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-brand-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
            <input
              type="text"
              placeholder="Cari nama atau dokumen..."
              className="w-full pl-10 pr-4 py-2 bg-brand-50 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-brand-400">Memuat percakapan...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-brand-400 text-sm">
              <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
              <p>Belum ada percakapan</p>
              <p className="text-xs mt-2 opacity-70">
                {user.role === 'admin' && 'Admin hanya bisa chat dengan Manager'}
                {user.role === 'staff' && 'Staff hanya bisa chat dengan Manager'}
                {user.role === 'manager' && 'Manager bisa chat dengan Admin & Staff'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv, idx) => (
              <div
                key={`${conv.user_id}-${conv.doc_id || 'general'}-${idx}`}
                onClick={() => handleOpenChat(conv.user_id, conv.doc_id)}
                className="p-4 border-b border-brand-100 hover:bg-brand-50 cursor-pointer transition-colors group"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {conv.user_name?.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-brand-900 truncate">{conv.user_name}</h3>
                      <span className="text-xs text-brand-400 flex-shrink-0">
                        {formatTime(conv.last_message_date)}
                      </span>
                    </div>
                    
                    {/* Document Name */}
                    {conv.doc_name && (
                      <div className="flex items-center gap-1 text-xs text-accent-600 mb-1">
                        <MessageSquare size={12} />
                        <span className="truncate font-medium">{conv.doc_name}</span>
                      </div>
                    )}

                    {/* Last Message Preview */}
                    <p className="text-sm text-brand-500 truncate">
                      {conv.last_message_content || 'Tidak ada pesan'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* KOLOM KANAN: Placeholder */}
      <div className="flex-1 bg-brand-50 flex items-center justify-center">
        <div className="text-center text-brand-400">
          <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Pilih percakapan untuk memulai obrolan</p>
        </div>
      </div>

      {/* MODAL PESAN BARU */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-brand-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-brand-900">Pesan Baru</h3>
              <button 
                onClick={() => setShowNewMessageModal(false)}
                className="text-brand-400 hover:text-brand-600 p-2 rounded-full hover:bg-brand-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Search User */}
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  className="w-full pl-10 pr-4 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>

              {/* List Available Users */}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-brand-400 py-4 text-sm">Tidak ada pengguna tersedia</p>
                ) : (
                  filteredUsers.map(u => (
                    <div
                      key={u.id}
                      onClick={() => handleStartNewChat(u)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-50 cursor-pointer transition-colors border border-brand-100"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-brand-900 text-sm">{u.name}</p>
                        <p className="text-xs text-brand-500">{u.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                        u.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}