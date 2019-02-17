'use strict';

const fetch = require('node-fetch');
const makeFetchSpecFile = require('../shared/make-fetch-spec-file');
const { version } = require('../../../package.json');

module.exports = makeFetchSpecFile(fetch, version);
