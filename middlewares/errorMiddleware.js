const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    STATUS: err.status,
        DATA: {},        

    ERRORS: [err.message], 
  });
};

const sendErrorForProd = (err, res) => {
  // أخطاء متوقعة (Operational)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
    STATUS: err.status,
        DATA: {}   ,

    ERRORS: [err.message], 
    });
  }
  

};

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

module.exports = globalError;