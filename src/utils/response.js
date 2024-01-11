// const logger = require("./logger/app-logger");
const MessageHelper = require('./message');
const { RESPONSE } = require('../constants/constants');

const returnSuccess = (req, res, code, data = "") => {
  res.status(200).json({
    code: 200,
    status: "success",
    data,
  });
};
// eslint-disable-next-line arrow-body-style
const responseSuccess = (res, message = RESPONSE.SUCCESS) => {
  return res.status(200).json({
    success: true,
    message,
  });
};
const responseError = (res, error, data = {}) => {
  console.log(`responseError === ${JSON.stringify(error)}`);
  error = error.message ? error.message : error;
  return res.status(400).json({
    success: false,
    message: error,
    data,
  });
};

const responsePermissonDenied = (res, langCode) => res.status(403).json({ ok: false, message: MessageHelper.getMessage('permissionDenied', langCode) });

const responseInternalServerError = (res, error, langCode) => {
  // log error to log file
  console.log(error.stack);
  return res.status(500).json({ ok: false, message: MessageHelper.getMessage('internalError', langCode) });
};

const responseErrorParam = (res, error, langCode) => {
  let message = '';
  if (typeof error === 'string') {
    message = MessageHelper.getMessage('invalidParams', langCode).replace('{param}', error);
  }
  return res.status(400).json({ ok: false, message });
};

const responseMissingParam = (res, fieldNames, langCode) => {
  const messages = [];
  fieldNames = (Array.isArray(fieldNames)) ? fieldNames : [fieldNames];
  fieldNames.forEach((fieldName) => {
    if (typeof fieldName === 'object' && !fieldName.value) {
      messages.push(MessageHelper.getMessage('missingParams', langCode).replace('{param}', fieldName.name));
    }
    if (typeof fieldName !== 'object') {
      messages.push(MessageHelper.getMessage('missingParams', langCode).replace('{param}', fieldName));
    }
  });
  return res.status(400).json({ ok: false, message: messages });
};

const responseNotFound = (res, object, langCode) => {
  const message = MessageHelper.getMessage('notFound', langCode).replace('{object}', object);
  return res.status(404).json({ ok: false, message });
};

const responseTokenInvalid = (res, message) => res.status(401).json({ ok: false, message });

const handleBasicException = (res, error, langCode) => {
  // logger.error(error);
  if (error.message === 'account_existed') {
    return this.responseError(res, MessageHelper.getMessage('accountExisted', langCode));
  } if (error.message === 'not_found') {
    return this.responseNotFound(res, error, langCode);
  } if (error.name === 'SequelizeValidationError') {
    return this.responseErrorParam(res, error.message, langCode);
  } if (error.name === 'SequelizeUniqueConstraintError') {
    return responseError(res, error.errors[0].message);
  } if (error.type === 'BadRequest') {
    return responseError(res, error.message);
  }
  return responseInternalServerError(res, error);
};

const returnFail = (req, res, err = 'fail') => {
  res.status(400).json({
    err,
  });
};

module.exports = {
  responseError,
  responsePermissonDenied,
  responseInternalServerError,
  responseErrorParam,
  responseMissingParam,
  responseNotFound,
  responseSuccess,
  responseTokenInvalid,
  handleBasicException,
  returnSuccess,
  returnFail
};
