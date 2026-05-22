const { ZodError } = require('zod');

function validationDetails(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    code: issue.code,
    message: issue.message
  }));
}

function normalizeError(error) {
  if (error.type === 'entity.too.large') {
    return {
      statusCode: 413,
      code: 'payload_too_large',
      message: 'Request body is too large'
    };
  }

  if (error instanceof SyntaxError && Object.hasOwn(error, 'body')) {
    return {
      statusCode: 400,
      code: 'invalid_json',
      message: 'Request body must be valid JSON'
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      code: 'validation_error',
      message: 'Request validation failed',
      details: validationDetails(error)
    };
  }

  if (error.code === 11000) {
    return {
      statusCode: 409,
      code: 'duplicate_resource',
      message: 'Resource already exists'
    };
  }

  if (error.name === 'ValidationError') {
    return {
      statusCode: 400,
      code: 'validation_error',
      message: 'Request validation failed'
    };
  }

  if (error.name === 'CastError') {
    return {
      statusCode: 400,
      code: 'invalid_id',
      message: 'Invalid resource identifier'
    };
  }

  if (error.statusCode) {
    return {
      statusCode: error.statusCode,
      code: error.code || 'request_error',
      message: error.message,
      details: error.details
    };
  }

  return {
    statusCode: 500,
    code: 'internal_error',
    message: 'Internal server error'
  };
}

function errorHandler(config) {
  return (error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    const normalized = normalizeError(error);
    const body = {
      error: {
        code: normalized.code,
        message: normalized.message
      }
    };

    if (normalized.details) {
      body.error.details = normalized.details;
    }

    if (!config.isProduction && !error.isOperational && error.stack) {
      body.error.stack = error.stack;
    }

    res.status(normalized.statusCode).json(body);
  };
}

module.exports = { errorHandler };
