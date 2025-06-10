function errorHandler(err, req, res, next) {
  console.error("Global error handler caught:", err);
  res.status(err.status || err.status || 500).json({
    error: err.message || "Something went wrong!",
    path: req.path,
  });
}

module.exports = { errorHandler };
