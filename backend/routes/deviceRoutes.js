const express = require('express');
const deviceController = require('../controllers/deviceController');
const { createAuthMiddleware } = require('../middleware/auth');
const { validateBody, validateParams } = require('../middleware/validate');
const { deviceCreateBody, deviceUpdateBody, idParam } = require('../validators/schemas');

function createDeviceRoutes(config) {
  const router = express.Router();
  const requireAuth = createAuthMiddleware(config);

  router.use(requireAuth);
  router.post('/', validateBody(deviceCreateBody), deviceController.registerDevice);
  router.get('/', deviceController.getDevices);
  router.get('/:id', validateParams(idParam), deviceController.getDevice);
  router.put(
    '/:id',
    validateParams(idParam),
    validateBody(deviceUpdateBody),
    deviceController.updateDevice
  );
  router.delete('/:id', validateParams(idParam), deviceController.deleteDevice);

  return router;
}

module.exports = createDeviceRoutes;
