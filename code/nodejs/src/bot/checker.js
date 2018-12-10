/* eslint-disable max-len */
const logger = require('../logger');
const datastore = require('../store/datastore');
const cache = datastore('cache');
const users = datastore('users');
const renderer = require('./renderer');

const ZERO = 0;

const checkResponse = (res, err) => {
  let error = err;

  if (!res || !res.status || !res.send) {
    logger.error('Function call without proper response object.');
    error = new Error('Function call without proper response object.');
    error.status = 500;
  } else {
    logger.info('Response object present.');
  }

  return error;
};

const checkRequest = (req, err) => {
  let error = err;

  if (!req || !req.body) {
    logger.warn('Function call without proper request object.');
    error = new Error('No valid request.');
    error.status = 400;
  } else {
    logger.info(`Request body ${JSON.stringify(req.body)}.`);
  }

  return error;
};

const validateRequest = (req, res, next) => {
  let error = null;

  logger.debug(`Checking request with error state ${error}...`);

  error = checkResponse(res, error);
  error = checkRequest(req, error);

  logger.debug(`Checked request with error state ${error}.`);

  if (error && error !== null) {
    logger.warn(`Forwarding error state ${error}.`);

    return next(error);
  }
  logger.debug('Forwarding no error.');

  return next();
};

const detectUser = async (req, res, next) => {
  logger.debug('Detecting user from request...');
  if (req.body.message &&
      req.body.message.sender &&
      req.body.message.sender.email) {

    try {
      let user = await users.get(users.key([
        'Users',
        req.body.message.sender.email,
      ]));

      if (user && user.length) {
        user = user[ZERO];
        logger.debug(`Found user: ${JSON.stringify(user)}. Logging in...`);
        req.login(user, {session: false});
      }

      return next();

    } catch (err) {
      logger.error(`ERROR: ${err}`);

      return next(err);
    }
  } else {
    logger.debug('Missing message with user details in request.');

    return next();
  }
};

const checkUser = async (req, res, next) => {
  if (!req.user || req.user === null || !req.user.email ||
      !req.user.refreshToken) {

    try {
      logger.debug(`Storing complete URL: ${req.body.configCompleteRedirectUrl}`);
      await cache.save({
        data: {
          url: req.body.configCompleteRedirectUrl,
        },
        key: cache.key([
          'Cache',
          'completeURL',
        ]),
      });
      logger.debug('Saved complete URL.');
      logger.debug('User not logged in. Returning URL for authentication...');
      res.
          send(renderer.configureOAuth(req, 'https://europe-west1-sound-datum-210112.cloudfunctions.net/sound-datum-210112-cf-fct/auth/google'));

      return null;
    } catch (err) {
      logger.error(`ERROR: ${err}`);

      return next(err);
    }
  } else {
    logger.debug(`User present: ${JSON.stringify(req.user)}.`);

    return next();
  }
};

// eslint-disable-next-line max-params
const errorMessage = (err, req, res, next) => {
  if (err && err.status && err.message) {
    logger.warn(`Something went wrong! error: ${JSON.stringify(err)}`);
    res.status(err.status).send(err.message);
  }
};

module.exports = {
  checkUser,
  detectUser,
  errorMessage,
  validateRequest,
};