/*
 * Copyright 2018 Dr. Michael Menzel, Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable max-len */
const logger = require('../logger');
const params = require('../params');
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
  if (req.body && req.body.message &&
      req.body.message.sender && req.body.message.sender.email) {
    try {
      // eslint-disable-next-line array-element-newline
      const user = (await users.get(users.key([
        'Users',
        req.body.message.sender.email,
      ])))[ZERO];

      logger.debug(`Found user: ${JSON.stringify(user)}. Logging in...`);
      if (user && user.length) req.login(user, {session: false});
    } catch (err) {
      logger.error(`ERROR: ${err}`);

      return next(err);
    }
  } else {
    logger.debug('Missing message with user details in request.');
  }

  return next();
};

const checkUser = async (req, res, next) => {
  if (!req.user || !req.user.email || !req.user.refreshToken) {
    try {
      await cache.save({
        data: {url: req.body.configCompleteRedirectUrl},
        key: cache.key([
          'Cache',
          'completeURL',
        ]),
      });
      logger.debug('Saved complete URL. Returning URL for authentication...');
      res.send(renderer.configureOAuth(req, params.oauth.authURL));

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