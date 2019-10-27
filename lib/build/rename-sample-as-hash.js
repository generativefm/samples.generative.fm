'use strict';
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const md5File = require('md5-file/promise');
const outputDirectory = require('../shared/output-directory');
const sample = require('./sample');

const rename = promisify(fs.rename);

const renameSampleAsHash = inputSample =>
  md5File(inputSample.absolutePath).then(contentHash => {
    const relativePath = `${contentHash}.${inputSample.extension}`;
    const absolutePath = path.join(
      outputDirectory,
      inputSample.instrumentName,
      inputSample.extension,
      relativePath
    );
    return rename(inputSample.absolutePath, absolutePath).then(() =>
      sample(Object.assign({}, inputSample, { relativePath, absolutePath }))
    );
  });

module.exports = renameSampleAsHash;
