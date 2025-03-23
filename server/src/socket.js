const jwt = require('jsonwebtoken');
const Message = require('./models/Message');

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, 'your-secret-key');
        socket.userId = decoded.userId;
        console.log(`User authenticated: ${socket.userId} with socket ID: ${socket.id}`);
        // Join a user-specific room for easier targeting
        socket.join(socket.userId);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.disconnect();
      }
    });

    socket.on('getChatHistory', async ({ recipientId }) => {
      if (!socket.userId) return;
      try {
        console.log(`Fetching chat history for user ${socket.userId} with ${recipientId}`);
        const messages = await Message.find({
          $or: [
            { senderId: socket.userId, recipientId },
            { senderId: recipientId, recipientId: socket.userId },
          ],
        }).sort('timestamp');
        socket.emit('loadMessages', messages);
        console.log(`Sent ${messages.length} messages to ${socket.userId}`);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    });

    socket.on('chatMessage', async ({ recipientId, message }) => {
      console.log('Received chatMessage event:', { recipientId, message, senderId: socket.userId });
      if (!socket.userId || !recipientId) {
        console.log('Message not sent: Missing userId or recipientId');
        return;
      }

      try {
        const msg = new Message({
          senderId: socket.userId,
          recipientId,
          message,
        });
        await msg.save();
        console.log('Message saved:', msg);

        const messageData = {
          senderId: socket.userId,
          recipientId,
          message,
          timestamp: msg.timestamp,
        };

        // Emit to sender's room
        io.to(socket.userId).emit('chatMessage', messageData);
        console.log(`Sent to sender room ${socket.userId}:`, messageData);

        // Emit to recipient's room
        io.to(recipientId).emit('chatMessage', messageData);
        console.log(`Sent to recipient room ${recipientId}:`, messageData);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = initializeSocket;