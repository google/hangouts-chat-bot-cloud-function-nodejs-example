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
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const base64url = require('base64url');

const logger = require('../logger');
const params = require('../params');
const passport = require('./passport');
const checker = require('../bot/checker');
const bot = require('../bot/bot');

const app = express();

app.use(bodyParser());
app.use(cookieParser('r2d2 is a bot'));
app.use(passport.initialize());
app.use(passport.session());

app.get(
    '/',
    (req, res) => {
      logger.debug('Sending static root directory file.');
      res.sendFile(`${__dirname}/static/index.html`);
    }
);
app.get(
    '/auth',
    (req, res) => {
      logger.debug('Sending static auth directory file.');
      res.sendFile(`${__dirname}/static/auth.html`);
    }
);
app.get(
    '/auth/google',
    (req, res, next) => {
      logger.debug(`Initiating authentication with state ${req.query.state}.`);
      passport.authenticate(
          'google',
          Object.assign(params.authentication, {state: req.query.state})
      )(req, res, next);
    }
);
app.get(
    '/auth/google/callback',
    (req, res, next) => {
      passport.authenticate(
          'google',
          params.authentication
      )(req, res, next);
    },
    (req, res) => {
      try {
        logger.debug('Completed authentication callback.');
        const completeURL = base64url.decode(req.query.state);

        if (completeURL && completeURL.length) {
          logger.debug(`Found complete URL: ${JSON.stringify(completeURL)}`);
          logger.debug('Redirecting to complete URL...');
          res.redirect(completeURL);
        }
      } catch (err) {
        logger.error(`ERROR: ${err}`);
      }
    }
);
app.get(
    '/auth/google/failure',
    (req, res) => {
      res.send('Could not complete login.');
    }
);

app.use(
    '/bot',
    checker.validateRequest,
    checker.detectUser,
    checker.checkUser,
    bot.conversation
);

app.use(checker.errorMessage);

module.exports = app;