const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const params = require('../../params');

module.exports = new RedisStore({
  host: params.cache.host,
  port: params.cache.port,
});