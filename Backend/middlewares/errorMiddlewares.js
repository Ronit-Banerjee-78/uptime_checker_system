const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] ${req.method} ${req.path} →`, err);

  res.status(status).json({
    success: false,
    error: message,
  });
};

export default errorHandler;
