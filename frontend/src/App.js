import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Halaman
import StaffDashboard from './pages/Staff/StaffDashboard';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ManagerDocuments from './pages/Manager/ManagerDocuments';
import ManagerReports from './pages/Manager/ManagerReports';
import UniversalChatRoom from './pages/UniversalChatRoom';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminDocuments from './pages/Admin/AdminDocuments';
import UniversalInbox from './pages/UniversalInbox';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* STAFF ROUTES */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <Layout><Outlet /></Layout>
            </ProtectedRoute>
          }>
            <Route index element={<StaffDashboard />} />
            <Route path="documents" element={<StaffDashboard />} />
            <Route path="inbox" element={<UniversalInbox />} />
            <Route path="chat/:userId" element={<UniversalChatRoom />} />
          </Route>

          {/* MANAGER ROUTES */}
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <Layout><Outlet /></Layout>
            </ProtectedRoute>
          }>
            <Route index element={<ManagerDashboard />} />
            <Route path="documents" element={<ManagerDocuments />} />
            <Route path="reports" element={<ManagerReports />} />
            <Route path="inbox" element={<UniversalInbox />} />
            <Route path="chat/:userId" element={<UniversalChatRoom />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><Outlet /></Layout>
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="inbox" element={<UniversalInbox />} />
            <Route path="chat/:userId" element={<UniversalChatRoom />} />
          </Route>

          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* TOAST CONTAINER */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light" 
      />
    </AuthProvider>
  );
}