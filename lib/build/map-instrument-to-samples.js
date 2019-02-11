'use strict';

const path = require('path');
const sample = require('./sample');

const mapInstrumentToSamples = (instrumentName, notes) =>
  Reflect.ownKeys(notes).map(note =>
    sample({
      instrumentName,
      note,
      relativePath: notes[note],
      extension: 'wav',
      absolutePath: path.resolve('./src', instrumentName, notes[note]),
    })
  );

module.exports = mapInstrumentToSamples;
