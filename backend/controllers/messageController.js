const db = require('../config/database');

// ✅ GET ALL MESSAGES FOR AUTHENTICATED USER
exports.getAllMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT m.*, 
             u_from.name AS from_name,
             u_from.email AS from_email,
             u_to.name AS to_name,
             u_to.email AS to_email,
             d.name AS doc_name
      FROM messages m
      LEFT JOIN users u_from ON m.from_user_id = u_from.id
      LEFT JOIN users u_to ON m.to_user_id = u_to.id
      LEFT JOIN documents d ON m.doc_id = d.id
      WHERE m.from_user_id = ? OR m.to_user_id = ?
      ORDER BY m.date DESC
    `;

    const [messages] = await db.execute(query, [userId, userId]);
    res.json(messages);
  } catch (error) {
    console.error('Error getAllMessages:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET CONVERSATIONS - REALLY SIMPLE & WORKS
exports.getConversations = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    // Tentukan role mana yang bisa diajak chat
    let allowedRoles = [];
    if (userRole === 'admin') {
      allowedRoles = ['manager'];
    } else if (userRole === 'staff') {
      allowedRoles = ['manager'];
    } else if (userRole === 'manager') {
      allowedRoles = ['admin', 'staff'];
    }
    
    // Query sederhana: ambil semua pesan yang melibatkan user ini
    const query = `
      SELECT DISTINCT
        CASE 
          WHEN m.from_user_id = ? THEN m.to_user_id
          ELSE m.from_user_id
        END as other_user_id,
        m.doc_id,
        MAX(m.date) as last_message_date
      FROM messages m
      WHERE (m.from_user_id = ? OR m.to_user_id = ?)
      AND m.doc_id IS NOT NULL
      GROUP BY other_user_id, m.doc_id
      ORDER BY last_message_date DESC
    `;
    
    const [conversations] = await db.execute(query, [userId, userId, userId]);
    
    // Untuk setiap conversation, ambil detail user dan pesan terakhir
    const result = await Promise.all(conversations.map(async (conv) => {
      const otherUserId = conv.other_user_id;
      const docId = conv.doc_id;
      
      // Ambil info user
      const [users] = await db.execute(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [otherUserId]
      );
      
      // Ambil info dokumen
      let docName = null;
      if (docId) {
        const [docs] = await db.execute(
          'SELECT name FROM documents WHERE id = ?',
          [docId]
        );
        docName = docs[0]?.name || null;
      }
      
      // Ambil pesan terakhir
      const [messages] = await db.execute(
        `SELECT content, date, from_user_id 
         FROM messages 
         WHERE ((from_user_id = ? AND to_user_id = ?) OR
                (from_user_id = ? AND to_user_id = ?))
         AND (doc_id = ? OR (doc_id IS NULL AND ? IS NULL))
         ORDER BY date DESC 
         LIMIT 1`,
        [userId, otherUserId, otherUserId, userId, docId, docId]
      );
      
      const user = users[0];
      const lastMsg = messages[0];
      
      return {
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        user_role: user.role,
        doc_id: docId,
        doc_name: docName,
        last_message_date: lastMsg?.date || conv.last_message_date,
        last_message_content: lastMsg?.content || ''
      };
    }));
    
    // Sort by latest message
    result.sort((a, b) => new Date(b.last_message_date) - new Date(a.last_message_date));
    
    res.json(result);
  } catch (error) {
    console.error("Error getConversations:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET CHAT WITH USER
exports.getChatWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { docId } = req.query;
    const currentUserId = req.user.id;
    
    let query = `
      SELECT m.*, 
             (SELECT name FROM users WHERE id = m.from_user_id) as from_name,
             (SELECT email FROM users WHERE id = m.from_user_id) as from_email
      FROM messages m
      WHERE ((m.from_user_id = ? AND m.to_user_id = ?) OR
             (m.from_user_id = ? AND m.to_user_id = ?))
    `;
    
    const params = [currentUserId, userId, userId, currentUserId];
    
    if (docId && docId !== 'null' && docId !== 'undefined') {
      query += ` AND m.doc_id = ?`;
      params.push(docId);
    }
    
    query += ` ORDER BY m.date ASC`;
    
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error getChatWithUser:", error);
    res.status(500).json({ message: error.message });
  }
};

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { to_user_id, subject, content, doc_id } = req.body;
    const from_user_id = req.user.id;
    
    const [result] = await db.execute(
      `INSERT INTO messages (from_user_id, to_user_id, subject, content, doc_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [from_user_id, to_user_id, subject, content, doc_id || null]
    );
    
    res.status(201).json({ 
      success: true, 
      id: result.insertId,
      message: 'Pesan berhasil dikirim' 
    });
  } catch (error) {
    console.error("Error sendMessage:", error);
    res.status(500).json({ message: error.message });
  }
};

// MARK AS READ
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    await db.execute(
      'UPDATE messages SET is_read = 1 WHERE id = ?',
      [messageId]
    );
    
    res.json({ success: true, message: 'Pesan ditandai sebagai dibaca' });
  } catch (error) {
    console.error("Error markAsRead:", error);
    res.status(500).json({ message: error.message });
  }
};