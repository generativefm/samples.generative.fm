'use strict';

const fs = require('fs');
const { promisify } = require('util');

const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

const mkdirIfNecessary = dirpath =>
  access(dirpath).catch(() => mkdir(dirpath, { recursive: true }));

module.exports = mkdirIfNecessary;
