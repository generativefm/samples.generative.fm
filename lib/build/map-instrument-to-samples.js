'use strict';

const path = require('path');
const sample = require('./sample');

const wavInputSample = ({ instrumentName, relativePath, note }) =>
  sample({
    instrumentName,
    relativePath,
    note,
    extension: 'wav',
    absolutePath: path.resolve(
      './src',
      'samples',
      instrumentName,
      relativePath
    ),
  });

const mapInstrumentToSamples = (instrumentName, samples) =>
  Array.isArray(samples)
    ? samples.map((relativePath, i) =>
        wavInputSample({ instrumentName, relativePath, note: i.toString() })
      )
    : Reflect.ownKeys(samples).map(note =>
        wavInputSample({ instrumentName, note, relativePath: samples[note] })
      );

module.exports = mapInstrumentToSamples;
