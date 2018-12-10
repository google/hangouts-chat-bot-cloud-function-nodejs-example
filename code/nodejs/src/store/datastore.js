const datastore = require('@google-cloud/datastore');

const params = require('../params');

module.exports = (prefix) => datastore({
  prefix,
  projectId: params.gcp.projectId,
});