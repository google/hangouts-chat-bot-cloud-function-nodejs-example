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