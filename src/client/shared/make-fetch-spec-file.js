'use strict';

const memoize = require('mem');
const DEFAULT_ENDPOINT = 'https://samples.generative.fm';

const makeFetchSpecFile = (fetch, version) =>
  memoize((endpoint = DEFAULT_ENDPOINT) => {
    const pathWithEndpoint = path =>
      `${endpoint}${endpoint.endsWith('/') ? '' : '/'}${path}`;
    return fetch(pathWithEndpoint(`index.${version}.json`))
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
  });

module.exports = makeFetchSpecFile;
