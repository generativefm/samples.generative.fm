'use strict';

const fs = require('fs');
const path = require('path');
const { createGunzip } = require('zlib');
const S3 = require('aws-sdk/clients/s3');
const glob = require('../shared/glob');
const mkdirIfNecessary = require('../shared/mkdir-if-necessary');
const outputDirectory = require('../shared/output-directory');
const apiVersion = require('../shared/s3-api-version');
const { BUCKET_NAME } = require('../shared/secrets');
const { version } = require('../../package.json');

const s3 = new S3({
  apiVersion,
  params: { Bucket: BUCKET_NAME },
});

const getDownloadStream = s3Key =>
  s3
    .getObject({ Key: s3Key })
    .createReadStream()
    .pipe(createGunzip());

const saveStreamToFile = (readStream, destinationFilePath) =>
  new Promise((resolve, reject) => {
    const destinationWriteStream = fs.createWriteStream(destinationFilePath);
    readStream
      .pipe(destinationWriteStream)
      .on('finish', () => {
        resolve();
      })
      .on('error', error => {
        reject(error);
      });
  });

const downloadFileAndReturn = (s3Key, destinationFilePath) => {
  const chunks = [];
  const downloadStream = getDownloadStream(s3Key).on('data', chunk => {
    chunks.push(chunk);
  });
  return saveStreamToFile(downloadStream, destinationFilePath).then(() =>
    JSON.parse(chunks.join(''))
  );
};

const getCurrentIndex = () => {
  const currentIndexFile = `index.${version}.json`;
  const localIndexFile = path.join(outputDirectory, currentIndexFile);
  return fs.promises
    .access(localIndexFile)
    .then(() => fs.promises.readFile(localIndexFile))
    .then(data => JSON.parse(data))
    .catch(() =>
      mkdirIfNecessary(outputDirectory).then(() =>
        downloadFileAndReturn(currentIndexFile, localIndexFile)
      )
    );
};

const getInstrumentFiles = instrumentSamples =>
  Reflect.ownKeys(instrumentSamples).reduce((fileList, format) => {
    const formatSamples = instrumentSamples[format];
    if (Array.isArray(formatSamples)) {
      return fileList.concat(formatSamples);
    } else if (typeof formatSamples === 'object') {
      return fileList.concat(Object.values(formatSamples));
    }
    return fileList;
  }, []);

const getFileList = samples =>
  Reflect.ownKeys(samples).reduce(
    (fileList, instrument) =>
      fileList.concat(getInstrumentFiles(samples[instrument])),
    []
  );

const downloadFile = (s3Key, destinationFilePath) =>
  saveStreamToFile(getDownloadStream(s3Key), destinationFilePath);

Promise.all([
  getCurrentIndex(),
  glob(path.join(outputDirectory, '**/*')).then(
    fullpaths =>
      new Set(
        fullpaths.map(filepath => filepath.replace(`${outputDirectory}/`, ''))
      )
  ),
]).then(([currentIndex, localFiles]) => {
  const sampleFiles = getFileList(currentIndex.samples);
  const filesToDownload = sampleFiles.filter(
    sampleFile => !localFiles.has(sampleFile)
  );
  let downloadedCount = 0;
  return Promise.all(
    filesToDownload.map(relativePath => {
      const localFilepath = path.join(outputDirectory, relativePath);
      return mkdirIfNecessary(path.dirname(localFilepath))
        .then(() => downloadFile(relativePath, localFilepath))
        .then(() => {
          downloadedCount += 1;
          console.log(
            `${relativePath} downloaded (${downloadedCount}/${
              filesToDownload.length
            })`
          );
        });
    })
  ).then(() => {
    console.log('Pull complete');
  });
});
