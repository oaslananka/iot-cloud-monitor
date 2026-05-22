const express = require('express');
const dataController = require('../controllers/dataController');
const { createAuthMiddleware } = require('../middleware/auth');
const { validateBody, validateParams } = require('../middleware/validate');
const { deviceIdParam, telemetryBody } = require('../validators/schemas');

function createDataRoutes(config) {
  const router = express.Router();
  const requireAuth = createAuthMiddleware(config);

  router.use(requireAuth);
  router.post('/', validateBody(telemetryBody), dataController.addData);
  router.get('/:deviceId', validateParams(deviceIdParam), dataController.getData);

  return router;
}

module.exports = createDataRoutes;
