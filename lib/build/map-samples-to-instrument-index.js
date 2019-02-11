'use strict';

const mapSamplesToInstrumentIndex = samples =>
  samples.reduce((instrumentsObj, sample) => {
    const { instrumentName, note, extension, relativePath } = sample;
    if (typeof instrumentsObj[instrumentName] === 'undefined') {
      instrumentsObj[instrumentName] = {};
    }
    if (typeof instrumentsObj[instrumentName][extension] === 'undefined') {
      instrumentsObj[instrumentName][extension] = {};
    }
    instrumentsObj[instrumentName][extension][note] = relativePath;
    return instrumentsObj;
  }, {});

module.exports = mapSamplesToInstrumentIndex;
