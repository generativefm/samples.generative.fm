'use strict';

const isUndefined = o => typeof o === 'undefined';

const mapSamplesToInstrumentIndex = samples =>
  samples.reduce((instrumentsObj, sample) => {
    const { instrumentName, note, extension, relativePath } = sample;
    const nonTonal = isUndefined(note);

    if (isUndefined(instrumentsObj[instrumentName])) {
      instrumentsObj[instrumentName] = {};
    }

    if (isUndefined(instrumentsObj[instrumentName][extension])) {
      instrumentsObj[instrumentName][extension] = nonTonal ? [] : {};
    }

    const instrumentFormatSamples = instrumentsObj[instrumentName][extension];

    if (nonTonal) {
      instrumentFormatSamples.push(relativePath);
    } else {
      instrumentFormatSamples[note] = relativePath;
    }

    return instrumentsObj;
  }, {});

module.exports = mapSamplesToInstrumentIndex;
