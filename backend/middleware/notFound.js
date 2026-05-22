function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'not_found',
      message: 'Route not found'
    }
  });
}

module.exports = { notFoundHandler };
