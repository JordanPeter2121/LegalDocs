import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { FileText, Download, Search, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // IMPORT AUTO TABLE SECARA TERPISAH

export default function ManagerReports() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedDocs, setSelectedDocs] = useState([]);

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

  // Filter dokumen
  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.created_by_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === 'active') {
      matchesDate = doc.status === 'aktif';
    } else if (dateFilter === 'expiring') {
      const daysLeft = Math.ceil((new Date(doc.validity) - new Date()) / (1000 * 60 * 60 * 24));
      matchesDate = daysLeft <= 30 && daysLeft > 0;
    } else if (dateFilter === 'archived') {
      matchesDate = doc.status === 'arsip';
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDocs(filteredDocs.map(doc => doc.id));
    } else {
      setSelectedDocs([]);
    }
  };

  // Handle select individual
  const handleSelectDoc = (id) => {
    if (selectedDocs.includes(id)) {
      setSelectedDocs(selectedDocs.filter(docId => docId !== id));
    } else {
      setSelectedDocs([...selectedDocs, id]);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const docsToExport = selectedDocs.length > 0 
      ? filteredDocs.filter(doc => selectedDocs.includes(doc.id))
      : filteredDocs;

    if (docsToExport.length === 0) {
      toast.warning("Tidak ada data untuk diexport");
      return;
    }

    const exportData = docsToExport.map(doc => ({
      'No': docsToExport.indexOf(doc) + 1,
      'Nama Dokumen': doc.name,
      'Nomor Dokumen': doc.number,
      'Tanggal Mulai': doc.start_date ? format(new Date(doc.start_date), 'dd MMMM yyyy', { locale: id }) : '-',
      'Tanggal Berakhir': doc.validity ? format(new Date(doc.validity), 'dd MMMM yyyy', { locale: id }) : '-',
      'Dibuat Oleh': doc.created_by_name,
      'Email Staff': doc.created_by_email,
      'Status': doc.status === 'aktif' ? 'Aktif' : 'Arsip',
      'Keterangan': doc.description || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Dokumen');
    
    const fileName = `Laporan_Audit_Dokumen_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success(`Berhasil export ${docsToExport.length} dokumen ke Excel!`);
  };

  // Export to PDF - FIXED VERSION
  const exportToPDF = () => {
    const docsToExport = selectedDocs.length > 0 
      ? filteredDocs.filter(doc => selectedDocs.includes(doc.id))
      : filteredDocs;

    if (docsToExport.length === 0) {
      toast.warning("Tidak ada data untuk diexport");
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Header
    doc.setFontSize(16);
    doc.text('LAPORAN AUDIT DOKUMEN LEGAL', 148, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.text('Sistem Pengolahan Dokumen Legal dan Arsip Kontrak Perusahaan', 148, 22, { align: 'center' });
    doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`, 148, 28, { align: 'center' });
    
    // Table Data
    const tableColumn = ['No', 'Nama Dokumen', 'Nomor', 'Staff', 'Berakhir', 'Status'];
    const tableRows = [];

    docsToExport.forEach((docItem, index) => {
      const docData = [
        index + 1,
        docItem.name,
        docItem.number,
        docItem.created_by_name,
        docItem.validity ? format(new Date(docItem.validity), 'dd MMM yyyy', { locale: id }) : '-',
        docItem.status === 'aktif' ? 'Aktif' : 'Arsip'
      ];
      tableRows.push(docData);
    });

    // Gunakan autoTable dengan cara yang benar
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      styles: { cellPadding: 2, overflow: 'linebreak' }
    });

    const fileName = `Laporan_Audit_Dokumen_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
    doc.save(fileName);
    toast.success(`Berhasil export ${docsToExport.length} dokumen ke PDF!`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-brand-900">Laporan Audit</h2>
        <p className="text-brand-500 mt-1">Monitor dan export laporan dokumen perusahaan</p>
      </div>

      {/* FILTER & EXPORT CONTROLS */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="label-text mb-1 block">Cari Dokumen</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
              <input 
                type="text" 
                placeholder="Cari nama, nomor, atau staff..." 
                className="pl-10 pr-4 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 w-full" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="w-full lg:w-48">
            <label className="label-text mb-1 block">Filter Status</label>
            <select 
              className="px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white w-full" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="arsip">Arsip</option>
            </select>
          </div>

          <div className="w-full lg:w-48">
            <label className="label-text mb-1 block">Filter Laporan</label>
            <select 
              className="px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white w-full" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Semua Dokumen</option>
              <option value="active">Dokumen Aktif</option>
              <option value="expiring">Segera Berakhir (30 hari)</option>
              <option value="archived">Dokumen Arsip</option>
            </select>
          </div>
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-brand-100">
          <button 
            onClick={exportToExcel}
            className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 bg-green-600 hover:bg-green-700 text-white border-none"
          >
            <FileSpreadsheet size={18} /> 
            Export Excel {selectedDocs.length > 0 && `(${selectedDocs.length})`}
          </button>
          
          <button 
            onClick={exportToPDF}
            className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white border-none"
          >
            <FileText size={18} /> 
            Export PDF {selectedDocs.length > 0 && `(${selectedDocs.length})`}
          </button>

          {selectedDocs.length > 0 && (
            <button 
              onClick={() => setSelectedDocs([])}
              className="text-sm text-brand-600 hover:text-brand-800 underline"
            >
              Batal Pilih ({selectedDocs.length})
            </button>
          )}
        </div>
      </div>

      {/* TABEL DOKUMEN */}
      <div className="card p-0 overflow-hidden border border-brand-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-50 text-brand-600 text-xs uppercase">
              <tr>
                <th className="p-4">
                  <input 
                    type="checkbox" 
                    checked={selectedDocs.length === filteredDocs.length && filteredDocs.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-brand-300 text-accent-600 focus:ring-accent-500"
                  />
                </th>
                <th className="p-4 font-semibold">Dokumen</th>
                <th className="p-4 font-semibold">Staff Input</th>
                <th className="p-4 font-semibold">Masa Berlaku</th>
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
                      <input 
                        type="checkbox" 
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => handleSelectDoc(doc.id)}
                        className="w-4 h-4 rounded border-brand-300 text-accent-600 focus:ring-accent-500"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-brand-900">{doc.name}</p>
                      <p className="text-xs text-brand-400 font-mono">{doc.number}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-brand-800">{doc.created_by_name}</p>
                      <p className="text-xs text-brand-400">{doc.created_by_email}</p>
                    </td>
                    <td className="p-4 text-sm text-brand-600">
                      {doc.validity ? format(new Date(doc.validity), 'dd MMM yyyy', { locale: id }) : '-'}
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