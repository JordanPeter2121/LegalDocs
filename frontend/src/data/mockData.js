// Ini data user kita
export const USERS = [
  { id: 1, name: 'Andi Staff', email: 'andi@company.com', role: 'staff' },
  { id: 2, name: 'Budi Manager', email: 'budi@company.com', role: 'manager' },
  { id: 3, name: 'Citra Admin', email: 'citra@company.com', role: 'admin' },
];

// Ini data dokumen awal (biar nggak kosong saat pertama dibuka)
export const INITIAL_DOCS = [
  {
    id: 1,
    name: 'Perjanjian Kerjasama Vendor A',
    number: 'PKS/2024/001',
    description: 'Kontrak penyediaan layanan cloud selama 12 bulan.',
    validity: '2025-12-31',
    status: 'aktif',
    file: 'pks_vendor_a.pdf',
    createdBy: 1, // Dibuat oleh Andi (id: 1)
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'NDP Klien Global Tech',
    number: 'NDP/2024/089',
    description: 'Perjanjian kerahasiaan data proyek digitalisasi.',
    validity: '2024-06-30',
    status: 'arsip',
    file: 'ndp_global.pdf',
    createdBy: 1,
    createdAt: '2024-02-10'
  }
];