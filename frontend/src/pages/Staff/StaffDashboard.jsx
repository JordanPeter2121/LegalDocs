import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { Plus, Trash2, Edit2, FileText, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-toastify';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal & Form States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '', number: '', start_date: '', validity: '', description: '', status: 'aktif', existing_file: ''
  });

  // FETCH DATA
  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents');
      const myDocs = res.data.filter(doc => doc.created_by === user.id);
      setDocs(myDocs);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      toast.error("Gagal memuat data dokumen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user.id]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // SUBMIT (CREATE & UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('number', formData.number);
    data.append('start_date', formData.start_date);
    data.append('validity', formData.validity);
    data.append('description', formData.description);
    data.append('status', formData.status);
    if (formData.existing_file) {
      data.append('existing_file', formData.existing_file);
    }
    if (selectedFile) {
      data.append('file', selectedFile);
    }

    try {
      if (isEditing) {
        await api.put(`/documents/${formData.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Dokumen berhasil diperbarui!");
      } else {
        await api.post('/documents', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Dokumen baru berhasil ditambahkan!");
      }
      setShowModal(false);
      fetchDocs();
      resetForm();
    } catch (error) {
      console.error("Gagal simpan:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan dokumen");
    }
  };

  // HAPUS DOKUMEN
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus dokumen ini?")) return;
    try {
      await api.delete(`/documents/${id}`);
      toast.success("Dokumen berhasil dihapus");
      fetchDocs();
    } catch (error) {
      toast.error("Gagal menghapus dokumen");
    }
  };

  // DOWNLOAD FILE
  const handleDownload = (filePath, fileName) => {
    if (!filePath) {
      toast.info("File tidak tersedia");
      return;
    }
    const url = `http://localhost:5000${filePath}`;
    window.open(url, '_blank');
  };

  // MODAL HELPERS
  const handleEdit = (doc) => {
    setFormData({
      id: doc.id,
      name: doc.name,
      number: doc.number,
      start_date: doc.start_date?.split('T')[0] || '',
      validity: doc.validity?.split('T')[0] || '',
      description: doc.description || '',
      status: doc.status || 'aktif',
      existing_file: doc.file_path || ''
    });
    setSelectedFile(null);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleNew = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', number: '', start_date: '', validity: '', description: '', status: 'aktif', existing_file: ''
    });
    setSelectedFile(null);
  };

  // LOGIKA SEARCH & FILTER
  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-900">Halo, {user.name}</h2>
          <p className="text-brand-500 mt-1">Kelola dokumen legal perusahaan dengan mudah.</p>
        </div>
        <button onClick={handleNew} className="btn-primary flex items-center gap-2 shadow-lg shadow-accent-500/20">
          <Plus size={18} /> Input Dokumen Baru
        </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
          <input
            type="text"
            placeholder="Cari nama atau nomor dokumen..."
            className="pl-10 pr-4 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white w-full sm:w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="arsip">Arsip</option>
        </select>
      </div>

      {/* TABEL DOKUMEN */}
      <div className="card p-0 overflow-hidden border border-brand-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-50 text-brand-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Dokumen</th>
                <th className="p-4 font-semibold">Periode</th>
                <th className="p-4 font-semibold">File</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 bg-white">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-brand-400">Memuat data...</td></tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-brand-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Tidak ada dokumen yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-brand-50/50 transition-colors group">
                    <td className="p-4">
                      <p className="font-medium text-brand-900">{doc.name}</p>
                      <p className="text-xs text-brand-400 font-mono">{doc.number}</p>
                      {doc.description && <p className="text-xs text-brand-500 mt-1 line-clamp-1">{doc.description}</p>}
                    </td>
                    <td className="p-4 text-sm text-brand-600">
                      <div className="flex flex-col gap-1">
                        <span>Mulai: {doc.start_date ? format(new Date(doc.start_date), 'dd MMM yyyy', { locale: id }) : '-'}</span>
                        <span>Berakhir: {doc.validity ? format(new Date(doc.validity), 'dd MMM yyyy', { locale: id }) : '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {doc.file_path ? (
                        <button 
                          onClick={() => handleDownload(doc.file_path, doc.name)}
                          className="inline-flex items-center gap-1 text-xs text-accent-600 hover:text-accent-800 font-medium"
                        >
                          <Download size={14} /> Download
                        </button>
                      ) : (
                        <span className="text-xs text-brand-400">No file</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${doc.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(doc)} className="p-2 hover:bg-white rounded-lg text-accent-600 shadow-sm">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-white rounded-lg text-red-500 shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-brand-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-bold text-brand-900">{isEditing ? 'Edit Dokumen' : 'Input Dokumen Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-brand-400 hover:text-brand-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Nomor Dokumen</label>
                  <input name="number" value={formData.number} onChange={handleChange} className="input" placeholder="PKS/2024/01" required />
                </div>
                <div>
                  <label className="label-text">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="input">
                    <option value="aktif">Aktif</option>
                    <option value="arsip">Arsip</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Tanggal Mulai</label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input" required />
                </div>
                <div>
                  <label className="label-text">Tanggal Berakhir</label>
                  <input type="date" name="validity" value={formData.validity} onChange={handleChange} className="input" required />
                </div>
              </div>
              
              <div>
                <label className="label-text">Judul Dokumen</label>
                <input name="name" value={formData.name} onChange={handleChange} className="input" placeholder="Nama kontrak / surat" required />
              </div>
              
              <div>
                <label className="label-text">Keterangan</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="input h-20 resize-none" placeholder="Ringkasan dokumen..." />
              </div>

              <div>
                <label className="label-text">Upload File</label>
                <div className="flex items-center gap-3">
                  <input type="file" onChange={handleFileChange} className="block w-full text-sm text-brand-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-50 file:text-accent-700 hover:file:bg-accent-100" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" />
                </div>
                {formData.existing_file && !selectedFile && (
                  <p className="text-xs text-brand-400 mt-1">File saat ini: {formData.existing_file.split('/').pop()}</p>
                )}
                {selectedFile && <p className="text-xs text-accent-600 mt-1">File baru: {selectedFile.name}</p>}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-brand-100 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">{isEditing ? 'Simpan Perubahan' : 'Upload Dokumen'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}