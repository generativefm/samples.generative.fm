'use strict';

const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const babel = require('rollup-plugin-babel');

module.exports = {
  input: './src/client/browser/browser.js',
  output: {
    file: './dist/browser.js',
    format: 'esm',
  },
  external: ['mem'],
  plugins: [
    resolve(),
    json({ compact: true }),

    commonjs({
      exclude: 'node_modules/**',
    }),
    babel({ exclude: 'node_modules/**' }),
  ],
};
