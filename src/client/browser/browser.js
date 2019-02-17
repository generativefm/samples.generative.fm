import makeFetchSpecFile from '../shared/make-fetch-spec-file';
import { version } from '../../../package.json';

export default makeFetchSpecFile(window.fetch, version);
