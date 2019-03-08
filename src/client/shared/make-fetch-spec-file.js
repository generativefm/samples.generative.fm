'use strict';

const memoize = require('mem');
const DEFAULT_ENDPOINT = 'https://samples.generative.fm';

const getDefaultSpecFilename = version => `index.${version}.json`;

const makeFetchSpecFile = (fetch, version) => {
  const fetchSpecFile = (
    endpoint = DEFAULT_ENDPOINT,
    filename = getDefaultSpecFilename(version)
  ) => {
    const pathWithEndpoint = path =>
      `${endpoint}${endpoint.endsWith('/') ? '' : '/'}${path}`;
    return fetch(pathWithEndpoint(filename))
      .then(response => response.json())
      .then(spec => {
        const { samples } = spec;
        Reflect.ownKeys(samples).forEach(instrumentName => {
          const instrumentSamplesByFormat = samples[instrumentName];
          Reflect.ownKeys(samples[instrumentName]).forEach(format => {
            const instrumentSamples = instrumentSamplesByFormat[format];
            if (Array.isArray(instrumentSamples)) {
              instrumentSamplesByFormat[format] = instrumentSamples.map(path =>
                pathWithEndpoint(path)
              );
            } else {
              instrumentSamplesByFormat[format] = Reflect.ownKeys(
                instrumentSamples
              ).reduce((samplesWithEndpoint, note) => {
                samplesWithEndpoint[note] = pathWithEndpoint(
                  instrumentSamples[note]
                );
                return samplesWithEndpoint;
              }, {});
            }
          });
        });
        return spec;
      });
  };
  return memoize(fetchSpecFile);
};

module.exports = makeFetchSpecFile;
