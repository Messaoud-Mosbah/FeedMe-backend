const { validationResult } = require('express-validator');

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => err.msg);

    return res.status(400).json({
      STATUS: 'fail',
       DATA: {},
      ERRORS: extractedErrors, 
     
    });
  }
  next();
};

module.exports = validatorMiddleware;