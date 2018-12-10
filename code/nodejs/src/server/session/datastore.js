const session = require('express-session');
const DatastoreStore = require('@google-cloud/connect-datastore')(session);
const datastore = require('../../store/datastore');

module.exports = (prefix) => new DatastoreStore({
  dataset: datastore(prefix),
});