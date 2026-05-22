const express = require('express');
const { createUserController } = require('../controllers/userController');
const { validateBody } = require('../middleware/validate');
const { loginUserBody, registerUserBody } = require('../validators/schemas');

function createUserRoutes(config) {
  const router = express.Router();
  const userController = createUserController(config);

  router.post('/register', validateBody(registerUserBody), userController.registerUser);
  router.post('/login', validateBody(loginUserBody), userController.loginUser);

  return router;
}

module.exports = createUserRoutes;
