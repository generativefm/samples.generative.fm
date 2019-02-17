'use strict';

const isNode = require('detect-node');

module.exports = isNode
  ? require('./src/client/node/node')
  : require('./dist/browser');
