import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { Eye, Send, AlertTriangle, CheckCircle, FileText, X, Mail, Archive } from 'lucide-react';
import { format, differenceInDays, isBefore } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-toastify';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Panel Detail (Sidebar Kanan)
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [sending, setSending] = useState(false);

  // 1. FETCH DATA
  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents');
      setDocs(res.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      toast.error("Gagal memuat data dokumen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // 2. LOGIKA STATISTIK (4 KOTAK)
  const totalDocs = docs.length;
  const activeDocs = docs.filter(d => d.status === 'aktif').length;
  const archivedDocs = docs.filter(d => d.status === 'arsip').length;
  const expiringDocs = docs.filter(d => {
    const daysLeft = differenceInDays(new Date(d.validity), new Date());
    return daysLeft < 30 && daysLeft > 0;
  }).length;

  // 3. KIRIM PESAN
  const handleSendMessage = async () => {
    if (!selectedDoc || !msgContent) return;
    
    setSending(true);
    try {
      await api.post('/messages', {
        to_user_id: selectedDoc.created_by,
        subject: msgSubject || `Revisi Dokumen: ${selectedDoc.name}`,
        content: msgContent,
        doc_id: selectedDoc.id
      });
      toast.success(`Instruksi berhasil dikirim ke ${selectedDoc.created_by_name}!`);
      setMsgSubject('');
      setMsgContent('');
      setSelectedDoc(null);
    } catch (error) {
      toast.error("Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] -m-8 overflow-hidden">
      
      {/* KIRI: LIST DOKUMEN & STATISTIK */}
      <div className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ${selectedDoc ? 'w-2/3' : 'w-full'}`}>
        
        {/*  4 KOTAK STATISTIK DI DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card border-l-4 border-l-blue-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-500 font-medium">Total Dokumen</p>
              <p className="text-3xl font-bold text-brand-900 mt-1">{loading ? '-' : totalDocs}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><FileText size={24} /></div>
          </div>
          <div className="card border-l-4 border-l-green-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-500 font-medium">Dokumen Aktif</p>
              <p className="text-3xl font-bold text-brand-900 mt-1">{loading ? '-' : activeDocs}</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-full"><CheckCircle size={24} /></div>
          </div>
          <div className="card border-l-4 border-l-orange-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-500 font-medium">Segera Berakhir</p>
              <p className="text-3xl font-bold text-brand-900 mt-1">{loading ? '-' : expiringDocs}</p>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><AlertTriangle size={24} /></div>
          </div>
          <div className="card border-l-4 border-l-gray-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-500 font-medium">Dokumen Arsip</p>
              <p className="text-3xl font-bold text-brand-900 mt-1">{loading ? '-' : archivedDocs}</p>
            </div>
            <div className="p-3 bg-gray-50 text-gray-600 rounded-full"><Archive size={24} /></div>
          </div>
        </div>

        {/* TABEL LAPORAN */}
        <div className="card p-0 overflow-hidden">
          <div className="p-5 border-b border-brand-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-brand-900">Daftar Dokumen Perusahaan</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-50 text-brand-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Dokumen</th>
                  <th className="p-4 font-semibold">Staff Input</th>
                  <th className="p-4 font-semibold">Masa Berlaku</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 bg-white">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-brand-400">Memuat laporan...</td></tr>
                ) : docs.map(doc => (
                  <tr key={doc.id} className="hover:bg-brand-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-brand-900">{doc.name}</p>
                      <p className="text-xs text-brand-400 font-mono">{doc.number}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs text-brand-600 font-bold">
                          {doc.created_by_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm text-brand-800">{doc.created_by_name}</p>
                          <p className="text-xs text-brand-400">{doc.created_by_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${isBefore(new Date(doc.validity), new Date()) ? 'text-red-500 font-bold' : 'text-brand-600'}`}>
                        {format(new Date(doc.validity), 'dd MMM yyyy', { locale: id })}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`badge ${doc.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-brand-200 text-brand-700 text-xs font-medium rounded-lg hover:bg-brand-50 hover:text-accent-600 hover:border-accent-200 transition-all shadow-sm"
                      >
                        <Eye size={14} /> Detail & Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KANAN: SIDEBAR DETAIL & CHAT */}
      {selectedDoc && (
        <div className="w-96 bg-white border-l border-brand-100 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-brand-100 flex justify-between items-start bg-brand-50/50">
            <div>
              <h3 className="font-bold text-brand-900 text-lg">Detail Dokumen</h3>
              <p className="text-xs text-brand-400 mt-1">Dibuat oleh: {selectedDoc.created_by_name}</p>
            </div>
            <button onClick={() => setSelectedDoc(null)} className="text-brand-400 hover:text-brand-600 p-1 rounded-full hover:bg-brand-200 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="bg-brand-50 p-4 rounded-lg border border-brand-100">
                <p className="text-xs text-brand-500 font-medium uppercase tracking-wide mb-1">Isi / Deskripsi</p>
                <p className="text-sm text-brand-700 leading-relaxed">{selectedDoc.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-brand-400">Nomor Dokumen</p>
                  <p className="text-sm font-mono text-brand-800">{selectedDoc.number}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-400">Berlaku Sampai</p>
                  <p className="text-sm text-brand-800">{selectedDoc.validity}</p>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-brand-100">
              <h4 className="font-bold text-brand-800 mb-4 flex items-center gap-2">
                <Mail size={18} className="text-accent-600" /> Kirim Instruksi ke Staff
              </h4>
              <div className="space-y-3">
                <input className="input text-sm" placeholder="Subjek (Opsional)..." value={msgSubject} onChange={e => setMsgSubject(e.target.value)} />
                <textarea className="input text-sm h-32 resize-none" placeholder="Contoh: Tolong perbarui masa berlaku..." value={msgContent} onChange={e => setMsgContent(e.target.value)} />
                <button onClick={handleSendMessage} disabled={sending || !msgContent} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={16} /> {sending ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}