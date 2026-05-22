const pino = require('pino');

function createLogger(config) {
  return pino({
    enabled: config.logLevel !== 'silent',
    level: config.logLevel,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.x-auth-token', 'password', 'token'],
      remove: true
    }
  });
}

module.exports = { createLogger };
