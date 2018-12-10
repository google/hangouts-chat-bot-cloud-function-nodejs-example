/* eslint-disable max-len */
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const datastore = require('../store/datastore');
const cache = datastore('cache');

const logger = require('../logger');
const params = require('../params');
const passport = require('./passport');
const checker = require('../bot/checker');
const bot = require('../bot/bot');

const app = express();

const ZERO = 0;

app.use(bodyParser());
app.use(cookieParser('r2d2 is a bot'));
app.use(passport.initialize());
app.use(passport.session());

app.get(
    '/auth/google',
    (req, res, next) => {
      logger.debug('Initiating authentication.');
      passport.authenticate(
          'google',
          params.authentication
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
    async (req, res) => {
      try {
        logger.debug('Completed authentication callback.');
        const completeURL = await cache.get(cache.key([
          'Cache',
          'completeURL',
        ]));

        if (completeURL && completeURL.length) {
          logger.debug(`Found complete URL: ${JSON.stringify(completeURL)}`);
          logger.debug('Redirecting to complete URL...');
          res.redirect(completeURL[ZERO].url);
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