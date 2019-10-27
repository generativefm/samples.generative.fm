'use strict';

const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const formats = require('./formats');
const mkdirIfNeccesary = require('../shared/mkdir-if-necessary');
const outputDirectory = require('../shared/output-directory');
const mapInstrumentToSamples = require('./map-instrument-to-samples');
const formatJobs = require('./format-jobs');
const renameSampleAsHash = require('./rename-sample-as-hash');
const mapSamplesToInstrumentIndex = require('./map-samples-to-instrument-index');
const glob = require('../shared/glob');
const isUndefined = require('../shared/is-undefined');
const instrumentSourceFile = require('../../src/samples/index.json');
const { version } = require('../../package.json');

const writeFile = promisify(fs.writeFile);

const SEMVAR_NUM_COUNT = 4;

const instrumentNames = Reflect.ownKeys(instrumentSourceFile);
const outputDirnames = instrumentNames.reduce(
  (allOutputDirnames, instrumentName) =>
    allOutputDirnames.concat(
      path.join(outputDirectory, instrumentName),
      ...formats.map(([extension]) =>
        path.join(outputDirectory, instrumentName, extension)
      )
    ),
  [outputDirectory]
);

const allFormatJobs = instrumentNames
  .map(instrumentName =>
    mapInstrumentToSamples(instrumentName, instrumentSourceFile[instrumentName])
  )
  .reduce(
    (jobs, instrumentSamples) =>
      jobs.concat(...instrumentSamples.map(sample => formatJobs(sample))),
    []
  );

const getPreviousIndexSamples = () =>
  glob(path.join(outputDirectory, 'index.*.json')).then(filenames => {
    const latestVersion = filenames.reduce(
      ([latestMajor, latestMinor, latestPatch], filename) => {
        const basename = path.basename(filename);
        const match = basename.match(/index.(\d+).(\d+).(\d+).json/);
        if (match === null) {
          return [latestMajor, latestMinor, latestPatch];
        }
        const [major, minor, patch] = match
          .slice(1, SEMVAR_NUM_COUNT)
          .map(numStr => Number(numStr));
        if (major > latestMajor) {
          return [major, minor, patch];
        }
        if (major === latestMajor) {
          if (minor > latestMinor) {
            return [major, minor, patch];
          }
          if (minor === latestMinor && patch > latestPatch) {
            return [major, minor, patch];
          }
        }
        return [latestMajor, latestMinor, latestPatch];
      },
      [0, 0, 0]
    );
    if (latestVersion.every(num => num === 0)) {
      return {};
    }
    const [latestMajor, latestMinor, latestPatch] = latestVersion;
    return fs.promises
      .readFile(
        path.join(
          outputDirectory,
          `index.${latestMajor}.${latestMinor}.${latestPatch}.json`
        )
      )
      .then(previousIndexStr => {
        const { samples } = JSON.parse(previousIndexStr);
        return samples;
      });
  });

const processJobs = jobs => {
  console.log(`Creating ${jobs.length} samples...`);
  let completedCount = 0;
  return Promise.all(
    jobs.reduce(
      (promises, job) =>
        promises.concat(
          job.execute().then(() => {
            completedCount += 1;
            console.log(
              `${job.outputSample.relativePath} created (${completedCount} / ${
                jobs.length
              })`
            );
          })
        ),
      []
    )
  )
    .then(() =>
      Promise.all(
        jobs.map(({ outputSample }) => renameSampleAsHash(outputSample))
      )
    )
    .then(renamedSamples => mapSamplesToInstrumentIndex(renamedSamples));
};

const mergeInstrumentSamples = (oldSamples, newSamples) =>
  Object.assign({}, oldSamples, newSamples);

Promise.all([
  getPreviousIndexSamples(),
  ...outputDirnames.map(dirname => mkdirIfNeccesary(dirname)),
])
  .then(([previousIndexSamples]) => {
    const jobsToProcess = allFormatJobs.filter(({ outputSample }) => {
      const instrumentSamples =
        previousIndexSamples[outputSample.instrumentName];
      return isUndefined(
        instrumentSamples &&
          instrumentSamples[outputSample.extension] &&
          instrumentSamples[outputSample.extension][outputSample.note]
      );
    });
    if (jobsToProcess.length === 0) {
      return previousIndexSamples;
    }
    return processJobs(jobsToProcess).then(newFormattedSamples =>
      mergeInstrumentSamples(previousIndexSamples, newFormattedSamples)
    );
  })
  .then(samples => {
    const instrumentIndex = {
      creationDate: new Date(),
      version,
      samples,
    };
    const newIndexFilepath = path.join(
      outputDirectory,
      `index.${version}.json`
    );
    return writeFile(
      newIndexFilepath,
      JSON.stringify(instrumentIndex, null),
      'utf8'
    ).then(() => {
      console.log(`${newIndexFilepath} saved.`);
    });
  })
  .catch(error => {
    console.error(error);
    //eslint-disable-next-line no-process-exit
    process.exit(1);
  });
