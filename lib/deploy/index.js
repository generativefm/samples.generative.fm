'use strict';

const path = require('path');
const fs = require('fs').promises;
const S3 = require('aws-sdk/clients/s3');
const glob = require('glob');
const { gzip } = require('node-gzip');
const { lookup } = require('mime-types');
const { BUCKET_NAME } = require('./secrets');

const S3_API_VERSION = '2006-03-01';

const globPromise = (pattern, opts) =>
  new Promise((resolve, reject) => {
    glob(pattern, opts, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

const s3 = new S3({
  apiVersion: S3_API_VERSION,
  params: { Bucket: BUCKET_NAME },
});

const getContentType = (filename = '') => {
  const contentType = lookup(filename);
  if (contentType) {
    return contentType;
  }
  return '';
};

const getExistingFiles = () =>
  s3
    .listObjectsV2()
    .promise()
    .then(({ Contents }) => Contents.map(({ Key }) => Key));

const uploadNonExistingFiles = existingFilenames =>
  globPromise('public/**/*.*').then(filenames => {
    if (filenames.length === 0) {
      console.log('No built files!');
      throw new Error('No files to upload!');
    }
    const uploadTasks = filenames
      .map(filename => ({
        localFilename: filename,
        bucketFilename: filename.replace('public/', ''),
      }))
      .filter(
        ({ bucketFilename }) => !existingFilenames.includes(bucketFilename)
      );

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

getExistingFiles().then(existingFilenames =>
  uploadNonExistingFiles(existingFilenames)
);
