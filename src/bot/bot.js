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

const logger = require('../logger');
const renderer = require('./renderer');
const params = require('../params');

const {BigQuery} = require('@google-cloud/bigquery');

const ZERO = 0;

const conversation = (req, res, next) => {
  try {
    logger.debug('Querying BigQuery...');
    const bigquery = new BigQuery({
      credentials: {
        client_id: params.oauth.clientID,
        client_secret: params.oauth.clientSecret,
        refresh_token: req.user.refreshToken,
        type: 'authorized_user',
      },
      email: req.user.email,
      projectId: params.gcp.projectId,
    });

    bigquery.query('SELECT 1 as nbr', {}).then((data) => {
      logger.debug(`Query result: ${JSON.stringify(data)}`);
      res.send(renderer.helloWorld(
          req,
          data.map((rows) => rows.
              map((record) => record.nbr).
              reduce((acc, curr) => acc + curr)).
              reduce((acc, curr) => acc + curr)
      ));
    });
  } catch (error) {
    logger.warn(`Could not query from BigQuery: ${JSON.stringify(error)}`);
    res.send(renderer.helloWorld(req, ZERO));
  }
};


module.exports = {
  conversation,
};
