# samples.generative.fm

Browser and Node client for accessing files from [samples.generative.fm].

> Access to [samples.generative.fm] is currently restricted with [CORS]([samples.generative.fm]). Unrecognized origins will not be able to fetch audio files.

## Usage

There are three ways to import the client.

### 1. Environment Automatic Detection

This method will detect if the package has been imported in a browser or Node environment.

```javascript
import fetchSpecFile from 'samples.generative.fm';
// or
const fetchSpecFile from 'samples.generative.fm';
```

### 2. Browser-only

```javascript
import fetchSpecFile from 'samples.generative.fm/browser-client';
```

### 3. Node-only

```javascript
const fetchSpecFile from 'samples.generative.fm/node-client';
```

The imported function can be used like so:

```javascript
fetchSpecFile('my-sample-host.com', 'sample-spec.json').then(sampleInfo => {
  console.log(sampleInfo.samples['sampled-instrument'].ogg['A4']);
  // outputs something like 'https://samples.generative.fm/sampled-instrument/ogg/<filename>.ogg'
});
```

## API

### `fetchSpecFile([baseUrl], [filename])`

Returns an object containing information about the samples.

#### Parameters

- `baseUrl` (string) [optional, default `'https://samples.generative.fm'`]: Prepended to all requests.
- `filename` (string) [optional, default `'index.<CURRENT_PKG_VERSION>'.json`]: The filename to use when fetching the spec file.

## Local Development

The package is built with `npm run build:pkg`.

[samples.generative.fm]: https://samples.generative.fm
