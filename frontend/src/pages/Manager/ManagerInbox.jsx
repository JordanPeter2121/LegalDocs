import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { MessageSquare, Search, Clock, FileText } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ManagerInbox() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error("Gagal ambil percakapan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Format waktu seperti WA
  const formatTime = (date) => {
    const dateObj = new Date(date);
    if (isToday(dateObj)) return format(dateObj, 'HH:mm');
    if (isYesterday(dateObj)) return 'Kemarin';
    return format(dateObj, 'dd/MM/yy');
  };

  const filteredConversations = conversations.filter(conv => 
    conv.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.doc_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-80px)] flex">
      
      {/* KOLOM KIRI: List Percakapan (seperti WA) */}
      <div className="w-96 bg-white border-r border-brand-200 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-brand-200 bg-brand-50">
          <h2 className="text-xl font-bold text-brand-900 mb-1">Pesan</h2>
          <p className="text-sm text-brand-500">{conversations.length} percakapan</p>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-brand-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
            <input
              type="text"
              placeholder="Cari staff atau dokumen..."
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
              Belum ada percakapan
            </div>
          ) : (
            filteredConversations.map((conv, idx) => (
              <div
                key={`${conv.user_id}-${conv.doc_id || 'general'}-${idx}`}
                onClick={() => navigate(`/manager/chat/${conv.user_id}${conv.doc_id ? `?doc=${conv.doc_id}` : ''}`)}
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
                        <FileText size={12} />
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
    </div>
  );
}