import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { ArrowLeft, Send, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function UniversalChatRoom() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const docId = searchParams.get('doc');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState(null);

  const fetchMessages = async () => {
    try {
      // Ambil pesan antara user saat ini (user.id) dan lawan bicara (userId)
      const res = await api.get(`/messages/chat/${userId}${docId ? `?docId=${docId}` : ''}`);
      setMessages(res.data);
      
      if (res.data.length > 0) {
        const firstMsg = res.data[0];
        // Logika universal: Cari siapa yang BUKAN saya
        const isFromMe = firstMsg.from_user_id === user.id;
        
        setChatInfo({
          userName: isFromMe ? firstMsg.to_name : firstMsg.from_name,
          userRole: isFromMe ? firstMsg.to_role : firstMsg.from_role,
          docName: firstMsg.doc_name
        });
      }
    } catch (error) {
      console.error("Gagal ambil pesan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId, docId]);

  // Auto scroll ke bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post('/messages', {
        to_user_id: userId, // Kirim ke orang yang kita chat
        subject: docId ? `Terkait: ${chatInfo?.docName}` : 'Pesan',
        content: newMessage,
        doc_id: docId || null
      });
      
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error("Gagal kirim:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-white">
      {/* Header Chat */}
      <div className="px-6 py-4 border-b border-brand-200 bg-brand-50 flex items-center gap-4 shadow-sm">
        <button 
          onClick={() => navigate(-1)} // Tombol back ke halaman sebelumnya (Inbox)
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-brand-600" />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold">
          {chatInfo?.userName?.charAt(0)}
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-brand-900">{chatInfo?.userName || 'Loading...'}</h3>
          <div className="flex items-center gap-2">
            {chatInfo?.userRole && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                chatInfo.userRole === 'manager' ? 'bg-purple-100 text-purple-700' :
                chatInfo.userRole === 'admin' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {chatInfo.userRole.toUpperCase()}
              </span>
            )}
            {chatInfo?.docName && (
              <div className="flex items-center gap-1 text-xs text-accent-600">
                <FileText size={12} />
                <span className="font-medium">{chatInfo.docName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Area Pesan */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-50">
        {loading ? (
          <div className="text-center text-brand-400 py-8">Memuat pesan...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-brand-400 py-8">
            <p>Belum ada pesan. Mulai percakapan!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isFromMe = msg.from_user_id === user.id;
            // Tampilkan tanggal jika pesan pertama atau tanggal beda dari sebelumnya
            const showDate = idx === 0 || 
              new Date(msg.date).toDateString() !== new Date(messages[idx-1].date).toDateString();

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="text-center my-4">
                    <span className="text-xs text-brand-400 bg-brand-200 px-3 py-1 rounded-full">
                      {format(new Date(msg.date), 'dd MMMM yyyy', { locale: id })}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                    isFromMe 
                      ? 'bg-accent-600 text-white rounded-br-none' 
                      : 'bg-white border border-brand-200 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1 text-right ${isFromMe ? 'text-accent-200' : 'text-brand-400'}`}>
                      {format(new Date(msg.date), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Pesan */}
      <form onSubmit={handleSend} className="p-4 border-t border-brand-200 bg-white">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary rounded-xl px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} /> Kirim
          </button>
        </div>
      </form>
    </div>
  );
}