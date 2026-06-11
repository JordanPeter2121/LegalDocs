const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files dari folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - WAJIB ADA SEMUA
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes')); // ✅ INI YANG HILANG
app.use('/api/admin', require('./routes/adminRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'LegalDocs API System',
    status: 'Running',
    endpoints: {
      auth: '/api/auth',
      documents: '/api/documents',
      messages: '/api/messages',
      admin: '/api/admin'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server berjalan di http://localhost:${PORT}`);
  console.log(` API Endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Documents: http://localhost:${PORT}/api/documents`);
  console.log(`   - Messages: http://localhost:${PORT}/api/messages`);
  console.log(`   - Admin: http://localhost:${PORT}/api/admin`);
});