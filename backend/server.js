const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const socketHandler = require('./sockets/socketHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Tạo HTTP Server bọc Express
const server = http.createServer(app);

// Cấu hình Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Gắn Socket handler vào server
socketHandler(io);

// Middlewares
app.use(cors());
app.use(express.json());

// Phục vụ static files (ảnh đại diện upload)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chat App Backend API is running with Socket.IO!' });
});

// Test connection and start server
const startServer = async () => {
  try {
    const connection = await db.getConnection();
    console.log('========================================');
    console.log('✅ Database connected successfully (MySQL)!');
    console.log('========================================');
    connection.release();

    server.listen(PORT, () => {
      console.log(`🚀 Server + Socket.IO is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
