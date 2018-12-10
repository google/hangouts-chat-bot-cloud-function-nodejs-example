const app = require('./server/app');
const logger = require('./logger');

const handler = (req, res) => {
  if (!req.url) {
    req.url = '/';
    req.path = '/';
  }

  logger.info(`Serving request on ${req.path} (${req.url})...`);

  return app(req, res);
};

module.exports = {
  handler,
};