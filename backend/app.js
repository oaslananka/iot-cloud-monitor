const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');

const { loadEnv } = require('./config/env');
const { AppError } = require('./utils/errors');
const { createLogger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFound');
const createDataRoutes = require('./routes/dataRoutes');
const createDeviceRoutes = require('./routes/deviceRoutes');
const createUserRoutes = require('./routes/userRoutes');

function createCorsOptions(config) {
  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (config.cors.origins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError(403, 'cors_origin_forbidden', 'Origin is not allowed'));
    }
  };
}

function createApp(config = loadEnv()) {
  const app = express();
  const logger = createLogger(config);

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors(createCorsOptions(config)));
  app.use(express.json({ limit: config.bodyLimit, strict: true }));

  if (!config.isTest) {
    app.use(
      pinoHttp({
        logger,
        redact: ['req.headers.authorization', 'req.headers.x-auth-token']
      })
    );
  }

  if (config.rateLimit.enabled) {
    app.use(
      '/api/users',
      rateLimit({
        windowMs: config.rateLimit.windowMs,
        limit: config.rateLimit.max,
        standardHeaders: 'draft-8',
        legacyHeaders: false
      })
    );
  }

  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'iot-cloud-monitor API',
      status: 'ok'
    });
  });

  app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/readyz', (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({ status: 'not_ready', mongodb: 'disconnected' });
      return;
    }

    res.status(200).json({ status: 'ready', mongodb: 'connected' });
  });

  app.use('/api/users', createUserRoutes(config));
  app.use('/api/devices', createDeviceRoutes(config));
  app.use('/api/data', createDataRoutes(config));

  app.use(notFoundHandler);
  app.use(errorHandler(config));

  return app;
}

module.exports = { createApp };
