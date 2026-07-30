const jwt = require('jsonwebtoken');
const User = require('../models/User');

let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret_key'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected to WebSocket: ${userId} (Socket ID: ${socket.id})`);

    // Join user-specific room
    socket.join(userId);

    socket.on('disconnect', () => {
      console.log(`User disconnected from WebSocket: ${userId} (Socket ID: ${socket.id})`);
    });
  });
};

const emitToUser = (userId, eventName, data) => {
  if (ioInstance) {
    ioInstance.to(userId.toString()).emit(eventName, data);
  }
};

module.exports = {
  initSocket,
  emitToUser
};