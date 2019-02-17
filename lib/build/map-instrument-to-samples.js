'use strict';

const path = require('path');
const sample = require('./sample');

const wavInputSample = ({ instrumentName, relativePath, note }) =>
  sample({
    instrumentName,
    relativePath,
    note,
    extension: 'wav',
    absolutePath: path.resolve('./src', instrumentName, relativePath),
  });

const mapInstrumentToSamples = (instrumentName, samples) =>
  Array.isArray(samples)
    ? samples.map(relativePath =>
        wavInputSample({ instrumentName, relativePath })
      )
    : Reflect.ownKeys(samples).map(note =>
        wavInputSample({ instrumentName, note, relativePath: samples[note] })
      );

module.exports = mapInstrumentToSamples;
