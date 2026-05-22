const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { signAccessToken } = require('../services/authService');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');

function createUserController(config) {
  return {
    registerUser: asyncHandler(async (req, res) => {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new AppError(409, 'duplicate_user', 'Resource already exists');
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash });

      res.status(201).json({
        user: user.toJSON()
      });
    }),

    loginUser: asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+passwordHash');

      if (!user) {
        throw new AppError(401, 'invalid_credentials', 'Invalid email or password');
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        throw new AppError(401, 'invalid_credentials', 'Invalid email or password');
      }

      res.status(200).json({
        token: signAccessToken(user, config),
        tokenType: 'Bearer',
        expiresIn: config.jwt.expiresIn
      });
    })
  };
}

module.exports = { createUserController };
