const { verifyAccessToken } = require('../services/authService');
const { AppError } = require('../utils/errors');

function readToken(req) {
  const authorization = req.header('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme && scheme.toLowerCase() === 'bearer' && token) {
    return token;
  }

  return req.header('x-auth-token');
}

function createAuthMiddleware(config) {
  return (req, res, next) => {
    const token = readToken(req);

    if (!token) {
      next(new AppError(401, 'unauthorized', 'Authentication is required'));
      return;
    }

    try {
      const decoded = verifyAccessToken(token, config);
      const id = decoded.sub || decoded.user?.id;

      if (!id) {
        next(new AppError(401, 'invalid_token', 'Token is not valid'));
        return;
      }

      req.user = { id };
      next();
    } catch {
      next(new AppError(401, 'invalid_token', 'Token is not valid'));
    }
  };
}

module.exports = { createAuthMiddleware };
