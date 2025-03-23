const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = 'your-secret-key';

// Username validation function
const validateUsername = (username) => {
  const minLength = 4;
  const hasNumber = /\d/.test(username);
  return username.length >= minLength && hasNumber;
};

router.post('/signup', async (req, res) => {
  const { username, password, firstName, lastName, gender, age, avatar } = req.body;

  console.log('Signup data:', { username, password, firstName, lastName, gender, age, avatar });

  // Validate username
  if (!validateUsername(username)) {
    return res.status(400).json({
      message: 'Username must be at least 4 characters long and contain at least one number',
    });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already in use, please choose another one' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      gender,
      age,
      avatar,
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    jwt.verify(token, JWT_SECRET);
    const users = await User.find({}, 'username _id firstName lastName gender age avatar');
    res.json(users);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;