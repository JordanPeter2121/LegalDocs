import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { Mail, User, Calendar, AlertCircle, Reply, Send } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Inbox() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk fitur balas
  const [replyingTo, setReplyingTo] = useState(null); // ID pesan yang sedang dibalas
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);

  // 1. Ambil Pesan dari Backend
  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      const myMessages = res.data.filter(msg => msg.to_user_id === user.id);
      setMessages(myMessages);
    } catch (error) {
      console.error("Gagal ambil pesan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user.id]);

  // 2. Fungsi Kirim Balasan
  const handleReply = async (originalMsg) => {
    if (!replyContent.trim()) return;
    
    setSending(true);
    try {
      // Kirim pesan balik ke orang yang mengirim pesan asli (Manager)
      await api.post('/messages', {
        to_user_id: originalMsg.from_user_id, // Kirim ke Manager
        subject: `Re: ${originalMsg.subject}`,
        content: replyContent,
        doc_id: originalMsg.doc_id // Tetap lampirkan ID dokumen terkait
      });
      
      alert("Balasan berhasil dikirim ke Manager!");
      setReplyContent('');
      setReplyingTo(null); // Tutup form balas
      fetchMessages(); // Refresh list pesan
    } catch (error) {
      console.error("Gagal kirim balasan:", error);
      alert("Gagal mengirim balasan.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-900">Inbox Pesan </h2>
          <p className="text-brand-500 mt-1">Instruksi dan catatan dari Manager.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 rounded-lg shadow-sm">
          <Mail size={18} className="text-accent-600" />
          <span className="font-medium text-brand-700">{messages.length} Pesan</span>
        </div>
      </div>

      {/* LIST PESAN */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-brand-400">Memuat pesan...</div>
        ) : messages.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
              <Mail size={32} className="text-brand-300" />
            </div>
            <h3 className="text-lg font-semibold text-brand-700">Tidak ada pesan baru</h3>
            <p className="text-brand-400 mt-1">Santai dulu, belum ada instruksi dari Manager.</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="card hover:shadow-md transition-shadow border-l-4 border-l-accent-500 relative overflow-hidden">
              
              {/* Bagian Atas: Pengirim & Waktu */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-sm">
                    {msg.from_name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-900">{msg.from_name}</h4>
                    <p className="text-xs text-brand-500">{msg.from_email || 'Manager'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-brand-400 bg-brand-50 px-2 py-1 rounded-md">
                  <Calendar size={12} />
                  {format(new Date(msg.date), 'dd MMM yyyy, HH:mm', { locale: id })}
                </div>
              </div>

              {/* Isi Pesan & Info Dokumen */}
              <div className="ml-13 pl-14">
                <h5 className="font-semibold text-accent-700 mb-1">{msg.subject}</h5>
                <p className="text-sm text-brand-600 leading-relaxed bg-brand-50/50 p-3 rounded-lg border border-brand-100 mb-3">
                  {msg.content}
                </p>
                
                {/* INI PERBAIKANNYA: Menampilkan Nama Dokumen dengan jelas */}
                {msg.doc_name && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-brand-700 bg-blue-50 p-2 rounded border border-blue-100">
                    <AlertCircle size={16} className="text-blue-500" />
                    <span className="font-medium">Dokumen Terkait:</span> 
                    <span className="font-bold text-blue-700">{msg.doc_name}</span>
                  </div>
                )}

                {/* FITUR BALAS CHAT */}
                {replyingTo === msg.id ? (
                  <div className="mt-2 p-3 bg-accent-50 rounded-lg border border-accent-100 animate-in slide-in-from-top-2">
                    <textarea
                      className="w-full input text-sm h-20 resize-none bg-white"
                      placeholder="Tulis balasan untuk Manager..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        onClick={() => setReplyingTo(null)} 
                        className="text-xs text-brand-500 hover:text-brand-700 px-2"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={() => handleReply(msg)}
                        disabled={sending || !replyContent}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <Send size={12} /> {sending ? 'Mengirim...' : 'Kirim Balasan'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setReplyingTo(msg.id)}
                    className="text-xs text-accent-600 font-medium hover:text-accent-800 flex items-center gap-1"
                  >
                    <Reply size={12} /> Balas Pesan
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}