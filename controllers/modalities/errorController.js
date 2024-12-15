const globalErrorHandler = (err, req, res, next) => {
  console.log("errorHandler on");
  console.log(err.message);
  console.error(err.stack);
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Set the response status code and send an error message
  const errorCode = err instanceof AppError ? err.code : 500;
  res.status(errorCode).json({ status: errorCode, error: err.message });
};

module.exports = globalErrorHandler;
