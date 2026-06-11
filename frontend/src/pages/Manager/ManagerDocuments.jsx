import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { FileText, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-toastify';

export default function ManagerDocuments() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Manager fetch dari endpoint umum /documents (bukan /admin)
  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents');
      setDocs(res.data);
    } catch (error) {
      console.error("Gagal ambil dokumen:", error);
      toast.error("Gagal memuat dokumen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchDocs(); 
  }, []);

  const handleDownload = (filePath, fileName) => {
    if (!filePath) { 
      toast.info("File tidak tersedia"); 
      return; 
    }
    window.open(`http://localhost:5000${filePath}`, '_blank');
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.created_by_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-900">Semua Dokumen</h2>
          <p className="text-brand-500 mt-1">Pantau seluruh dokumen yang diinput staff</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
            <input 
              type="text" 
              placeholder="Cari dokumen/nomor/staff..." 
              className="pl-10 pr-4 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 w-full sm:w-64" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <select 
            className="px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="arsip">Arsip</option>
          </select>
        </div>
      </div>

      {/* TABEL DOKUMEN (View Only untuk Manager) */}
      <div className="card p-0 overflow-hidden border border-brand-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-50 text-brand-600 text-xs uppercase">
              <tr>
                <th className="p-4 font-semibold">Dokumen</th>
                <th className="p-4 font-semibold">Oleh</th>
                <th className="p-4 font-semibold">Periode</th>
                <th className="p-4 font-semibold">File</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 bg-white">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-brand-400">Memuat data...</td></tr>
              ) : filteredDocs.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-brand-400">
                  <FileText size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Tidak ada dokumen ditemukan</p>
                </td></tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-brand-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-brand-900">{doc.name}</p>
                      <p className="text-xs text-brand-400 font-mono">{doc.number}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-brand-800">{doc.created_by_name}</p>
                      <p className="text-xs text-brand-400">{doc.created_by_email}</p>
                    </td>
                    <td className="p-4 text-sm text-brand-600">
                      <div className="flex flex-col gap-1">
                        <span>Mulai: {doc.start_date ? format(new Date(doc.start_date), 'dd MMM yyyy', { locale: id }) : '-'}</span>
                        <span>Berakhir: {doc.validity ? format(new Date(doc.validity), 'dd MMM yyyy', { locale: id }) : '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {doc.file_path ? (
                        <button onClick={() => handleDownload(doc.file_path, doc.name)} className="inline-flex items-center gap-1 text-xs text-accent-600 hover:text-accent-800 font-medium">
                          <Download size={14} /> Download
                        </button>
                      ) : <span className="text-xs text-brand-400">No file</span>}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${doc.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}