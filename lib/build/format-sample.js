'use strict';

const path = require('path');
const formats = require('./formats');
const outputDirectory = require('./output-directory');
const sample = require('./sample');

const formatSample = inputSample =>
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
    return conversionFn(inputSample.absolutePath, absolutePath).then(() =>
      sample(
        Object.assign({}, inputSample, {
          absolutePath,
          relativePath,
          extension,
        })
      )
    );
  });

module.exports = formatSample;
