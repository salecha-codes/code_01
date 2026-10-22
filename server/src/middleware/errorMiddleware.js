export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.status || 500;
  let message = error.message;
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    status = 400;
    message = 'Please check the submitted fields.';
  }
  if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'The request must contain valid JSON.';
  }
  if (error.type === 'entity.too.large') {
    status = 413;
    message = 'The request is too large.';
  }
  if (status >= 500) {
    // Do not log request bodies, cookies, comments, addresses, or database URIs.
    console.error('Request failed:', error.name);
    message = 'Something went wrong. Please try again shortly.';
  }
  res.status(status).json({ error: { message } });
}
