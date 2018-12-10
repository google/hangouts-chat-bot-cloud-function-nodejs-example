const {createLogger, format, transports} = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');

const logger = createLogger({
  format: format.simple(),
  level: 'debug',
  transports: [new transports.Console()],
});

if ('environment' in process.env && process.env.environment === 'production') {
  logger.add(new LoggingWinston());
}

module.exports = logger;