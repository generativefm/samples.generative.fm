'use strict';

const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const babel = require('rollup-plugin-babel');

module.exports = {
  input: './src/client/browser/browser.js',
  output: {
    file: 'browser-client.js',
    format: 'cjs',
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
