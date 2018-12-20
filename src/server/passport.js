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

/* eslint-disable max-params,max-len,no-magic-numbers */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const logger = require('../logger');
const params = require('../params');
const datastore = require('../store/datastore');
const users = datastore('users');


passport.use(new GoogleStrategy(
    {
      callbackURL: params.oauth.callbackURL,
      clientID: params.oauth.clientID,
      clientSecret: params.oauth.clientSecret,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(`Got user ${profile.id} with access token ${accessToken} and refresh token ${refreshToken}.`);
        logger.info(`Profile of user: ${JSON.stringify(profile)}`);

        const user = {
          accessToken,
          email: profile.emails[0].value,
          refreshToken,
        };

        await users.save({
          data: user,
          key: users.key([
            'Users',
            user.email,
          ]),
        });
        logger.debug(`Saved user ${JSON.stringify(user)}.`);
        done(null, user);
      } catch (err) {
        logger.error(`ERROR: ${err}`);
        done(err, null);
      }
    }
));

passport.serializeUser((user, done) => {
  logger.debug(`Serializing user: ${JSON.stringify(user.email)}`);
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    logger.debug(`Deserializing user: ${email}`);
    const user = await users.get(users.key([
      'Users',
      email,
    ]));

    logger.debug(`Found user: ${JSON.stringify(user)}`);
    done(null, user);
  } catch (err) {
    logger.error('ERROR:', err);
    done(err, null);
  }
});

module.exports = passport;