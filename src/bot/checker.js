/*
 * Copyright 2018 Google LLC
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
const base64url = require('base64url');
const HttpStatus = require('http-status-codes');

const logger = require('../logger');
const params = require('../params');
const datastore = require('../store/datastore');
const users = datastore('users');
const renderer = require('./renderer');

const ZERO = 0;

const checkResponse = (res, err) => {
  let error = err;

  if (!res || !res.status || !res.send) {
    logger.error('Function call without proper response object.');
    error = new Error('Function call without proper response object.');
    error.status = HttpStatus.INTERNAL_SERVER_ERROR;
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
    error.status = HttpStatus.BAD_REQUEST;
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

  if (error) {
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

const checkUser = (req, res, next) => {
  if (!req.user || !req.user.email || !req.user.refreshToken) {
    if (!req.body.configCompleteRedirectUrl) return next(new Error('No configuration completion URL provided.'));
    try {
      logger.debug('Saved complete URL. Returning URL for authentication...');
      res.send(renderer.configureOAuth(req, `${params.oauth.authURL}?state=${base64url(req.body.configCompleteRedirectUrl)}`));

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
  if (err && err.message) {
    logger.warn(`Something went wrong! error: ${JSON.stringify(err)}`);
    res.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).send(err.message);
  }
};

module.exports = {
  checkUser,
  detectUser,
  errorMessage,
  validateRequest,
};