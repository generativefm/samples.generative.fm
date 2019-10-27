'use strict';

const path = require('path');
const fs = require('fs').promises;
const S3 = require('aws-sdk/clients/s3');
const { gzip } = require('node-gzip');
const { lookup } = require('mime-types');
const chalk = require('chalk');
const glob = require('../shared/glob');
const apiVersion = require('../shared/s3-api-version');
const { BUCKET_NAME } = require('../shared/secrets');

const s3 = new S3({
  apiVersion,
  params: { Bucket: BUCKET_NAME },
});

const getContentType = (filename = '') => {
  const contentType = lookup(filename);
  if (contentType) {
    return contentType;
  }
  return '';
};

const getExistingFiles = ContinuationToken =>
  s3
    .listObjectsV2({ ContinuationToken })
    .promise()
    .then(({ Contents, IsTruncated, NextContinuationToken }) => {
      const filenames = Contents.map(({ Key }) => Key);
      if (IsTruncated) {
        return getExistingFiles(NextContinuationToken).then(nextFilenames =>
          filenames.concat(nextFilenames)
        );
      }
      return filenames;
    });

const uploadNonExistingFiles = existingFilenames =>
  glob('public/**/*.*').then(filenames => {
    if (filenames.length === 0) {
      return Promise.reject(new Error('No built files!'));
    }

    const existingFilenamesSet = new Set(existingFilenames);

    const uploadTasks = filenames
      .map(filename => ({
        localFilename: filename,
        bucketFilename: filename.replace('public/', ''),
      }))
      .filter(
        ({ bucketFilename }) => !existingFilenamesSet.has(bucketFilename)
      );

    if (uploadTasks.length === 0) {
      return Promise.reject(
        new Error('No files to upload; did you forget to build?')
      );
    }

    let completed = 0;
    return Promise.all(
      uploadTasks.map(({ localFilename, bucketFilename }) =>
        fs
          .readFile(path.resolve(localFilename))
          .then(file => gzip(file))
          .then(buffer => {
            const uploadParams = {
              Key: bucketFilename,
              Body: buffer,
              ACL: 'public-read',
              ContentType: getContentType(localFilename),
              ContentEncoding: 'gzip',
              CacheControl: 'max-age=31536000',
            };
            return s3
              .upload(uploadParams)
              .promise()
              .then(() => {
                completed += 1;
                console.log(
                  `${bucketFilename} upload complete (${completed}/${
                    uploadTasks.length
                  })`
                );
              });
          })
      )
    );
  });

getExistingFiles()
  .then(existingFilenames => uploadNonExistingFiles(existingFilenames))
  .then(() => {
    console.log(chalk.green('Deployment complete.'));
  })
  .catch(err => {
    console.log(chalk.red(err.message));
    console.log(chalk.red('Deployment failed.'));
  });
