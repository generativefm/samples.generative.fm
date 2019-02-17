# samples.generative.fm

Browser and Node client for accessing files from [samples.generative.fm](https://samples.generative.fm).

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
import fetchSpecFile from 'samples.generative.fm/dist/browser';
```

### 3. Node-only

```javascript
const fetchSpecFile from 'samples.generative.fm/node';
```

The imported function can be used like so:

```javascript
fetchSpecFile().then(specFile => {
  console.log(specFile.samples['sampled-instrument'].ogg['A4']);
  // outputs something like 'https://samples.generative.fm/sampled-instrument/ogg/<filename>.ogg'
});
```

## Local Development

The package is built with `npm run build:pkg`.
