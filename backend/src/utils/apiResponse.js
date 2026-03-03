const sendSuccess = (res, { data, message, statusCode = 200 }) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

module.exports = {
  sendSuccess,
};

