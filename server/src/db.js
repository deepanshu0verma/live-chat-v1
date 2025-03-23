const mongoose = require('mongoose');

const DB_URL = 'mongodb+srv://deepanshu2580:deepanshu321@cluster0.p9ckrhy.mongodb.net/live-chat-v1?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;