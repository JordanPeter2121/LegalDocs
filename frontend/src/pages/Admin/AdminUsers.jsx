import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify'; // IMPORT TOAST

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'staff'
  });

  const fetchData = async () => {
    try {
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      toast.error("Gagal memuat data pengguna"); // GANTI ALERT
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, formData);
        toast.success("User berhasil diupdate!"); // GANTI ALERT
      } else {
        await api.post('/admin/users', formData);
        toast.success("User berhasil ditambahkan!"); // GANTI ALERT
      }
      setShowUserModal(false);
      fetchData();
      setFormData({ name: '', email: '', password: '', role: 'staff' });
      setEditingUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan user"); // GANTI ALERT
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowUserModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus?")) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("Berhasil dihapus!"); // GANTI ALERT
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus"); // GANTI ALERT
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-900">Manajemen User</h2>
          <p className="text-brand-500 mt-1">Kelola pengguna sistem (Staff, Manager, Admin)</p>
        </div>
        <button 
          onClick={() => { setShowUserModal(true); setEditingUser(null); setFormData({ name: '', email: '', password: '', role: 'staff' }); }}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={18} /> Tambah User
        </button>
      </div>

      {/* Tabel User */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-brand-400">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-50 text-brand-600 text-xs uppercase">
                <tr>
                  <th className="p-4 font-semibold">Nama</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-brand-50">
                    <td className="p-4 font-medium text-brand-900">{u.name}</td>
                    <td className="p-4 text-sm text-brand-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`badge ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                        u.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg mr-2"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit User */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4">
            <h3 className="text-xl font-bold text-brand-900 mb-6">
              {editingUser ? 'Edit User' : 'Tambah User Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Nama</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label-text">Password</label>
                <input
                  type="password"
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="label-text">Role</label>
                <select
                  className="input"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowUserModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}