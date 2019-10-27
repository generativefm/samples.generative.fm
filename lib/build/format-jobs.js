'use strict';

const path = require('path');
const formats = require('./formats');
const outputDirectory = require('../shared/output-directory');
const sample = require('./sample');

const formatJobs = inputSample =>
  formats.map(([extension, conversionFn]) => {
    const relativePath = `${path.basename(
      inputSample.relativePath,
      inputSample.extension
    )}${extension}`;
    const absolutePath = path.join(
      outputDirectory,
      inputSample.instrumentName,
      extension,
      relativePath
    );
    const execute = () => {
      conversionFn(inputSample.absolutePath, absolutePath);
    };
    const outputSample = sample(
      Object.assign({}, inputSample, {
        absolutePath,
        relativePath,
        extension,
      })
    );
    return {
      inputSample,
      outputSample,
      execute,
    };
  });

module.exports = formatJobs;
