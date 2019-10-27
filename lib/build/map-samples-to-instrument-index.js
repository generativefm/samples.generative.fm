'use strict';

const path = require('path');
const isUndefined = require('../shared/is-undefined');

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

    const pathRelativeToRoot = path.join(
      instrumentName,
      extension,
      relativePath
    );

    const instrumentFormatSamples = instrumentsObj[instrumentName][extension];

    if (nonTonal) {
      instrumentFormatSamples.push(pathRelativeToRoot);
    } else {
      instrumentFormatSamples[note] = pathRelativeToRoot;
    }

    return instrumentsObj;
  }, {});

module.exports = mapSamplesToInstrumentIndex;
