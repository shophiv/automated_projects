const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

const registerUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Please provide both email and password');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    passwordHash
  });

  if (user) {
    return {
      _id: user._id,
      email: user.email,
      token: generateToken(user._id)
    };
  } else {
    throw new Error('Invalid user data received');
  }
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Please provide both email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return {
    _id: user._id,
    email: user.email,
    token: generateToken(user._id)
  };
};

module.exports = {
  registerUser,
  loginUser
};