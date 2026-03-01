const ApiError = require("../utils/apiError");

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    STATUS: err.status,
    MESSAGE:err.message,
        DATA: {},        

    ERRORS: [err.message], 
  });
};

const sendErrorForProd = (err, res) => {
  // أخطاء متوقعة (Operational)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
    STATUS: err.status,
        MESSAGE:err.message,

        DATA: {}   ,

    ERRORS: [err.message], 
    });
  }
  

};
const handle =()=> new ApiError("Invalid token,please login again..",401)

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {

    sendErrorForDev(err, res);
  } else {
  if (err.name==='jsonWebTokenError') err=handle();
    if (err.name==='TokenExpiredError') err=handle()

    sendErrorForProd(err, res);
  }
};

module.exports = globalError;