const jwt = require('jsonwebtoken');

function userIdForToken(user) {
  return (user._id || user.id).toString();
}

function signAccessToken(user, config) {
  const subject = userIdForToken(user);

  return jwt.sign({ user: { id: subject } }, config.jwt.secret, {
    algorithm: 'HS256',
    audience: config.jwt.audience,
    issuer: config.jwt.issuer,
    subject,
    expiresIn: config.jwt.expiresIn
  });
}

function verifyAccessToken(token, config) {
  return jwt.verify(token, config.jwt.secret, {
    algorithms: config.jwt.algorithms,
    audience: config.jwt.audience,
    issuer: config.jwt.issuer
  });
}

module.exports = { signAccessToken, verifyAccessToken };
