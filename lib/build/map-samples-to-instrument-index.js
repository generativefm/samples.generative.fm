'use strict';

const path = require('path');
const isUndefined = require('../shared/is-undefined');

const mapSamplesToInstrumentIndex = samples =>
  samples.reduce((instrumentsObj, sample) => {
    const { instrumentName, note, extension, relativePath } = sample;
    const nonTonal = /^\d+$/.test(note);

    if (isUndefined(instrumentsObj[instrumentName])) {
      instrumentsObj[instrumentName] = {};
    }

    if (isUndefined(instrumentsObj[instrumentName][extension])) {
      instrumentsObj[instrumentName][extension] = nonTonal ? [] : {};
    }

    const pathRelativeToRoot = path.join(
      instrumentName,
      extension,
      relativePath
    );

    instrumentsObj[instrumentName][extension][note] = pathRelativeToRoot;

    return instrumentsObj;
  }, {});

module.exports = mapSamplesToInstrumentIndex;
