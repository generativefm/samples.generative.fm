'use strict';

const { promisify } = require('util');
const childProcess = require('child_process');
const { Lame } = require('node-lame');

const exec = promisify(childProcess.exec);

const oggQuality = 6;
const mp3Bitrate = 192;

const formats = [
  [
    'ogg',
    (inputFilepath, outputFilepath) =>
      exec(`sox ${inputFilepath} -C${oggQuality} ${outputFilepath}`),
  ],
  [
    'mp3',
    (inputFilepath, outputFilepath) =>
      new Lame({ output: outputFilepath, bitrate: mp3Bitrate })
        .setFile(inputFilepath)
        .encode(),
  ],
];

module.exports = formats;
