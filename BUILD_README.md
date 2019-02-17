# samples.generative.fm

Storage and tooling for samples used by [generative.fm](https://github.com/generative-music/generative.fm).

## Prerequisites

To run the build process, [SoX](http://sox.sourceforge.net/) and [LAME](http://lame.sourceforge.net/) are required.

### Windows

Consult [this guide](https://github.com/JoFrhwld/FAVE/wiki/Sox-on-Windows) for SoX installation instructions.
See [here](https://github.com/jankarres/node-lame#install-on-windows) for LAME installations instructions.

## Build

Compressed versions of the source samples are created with `npm run build`.

Source samples can be found in the [`src/samples`](src/samples) directory, organized by instrument. Currently, only `.wav` files are supported as sources.

The build process is as follows:

1. Source files are converted into compressed formats (currently `.ogg` and `.mp3`) and placed in the `public` directory organized by instrument and by format. For example, a source sample `src/samples/guitar/a4.wav` would be converted to `public/guitar/ogg/a4.ogg` and `public/guitar/mp3/a4.mp3`. Source files are listed in [`src/samples/index.json`](src/samples/index.json).
2. The output files are renamed to the [MD5 hash](https://en.wikipedia.org/wiki/MD5#MD5_hashes) of the file content. For example, `public/guitar/ogg/a4.ogg` would be renamed to `public/guitar/ogg/<CONTENT_HASH>.ogg`.
3. An index file which contains information about the created samples is output to the `public` directory. The filename is named like `index.<VERSION>.json`, where `<VERSION>` is the version listed in [`package.json`](package.json).

## Deployment

Current samples are available at [samples.generative.fm](https://samples.generative.fm/).

Authorized users can deploy the `public` directory with `npm run deploy`.
