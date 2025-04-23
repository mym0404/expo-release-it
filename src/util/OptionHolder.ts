import pkgJson from "../../package.json";
import {fileURLToPath} from "url";
import * as path from "node:path";

export type ProgramOptions = {
  rootDir?: string;
}

export const OptionHolder: {
  cli: { version: string; rootDir: string; templateDir: string };
  iosBundleIdentifier: string;
  androidPackageName: string;
} & Required<ProgramOptions> = {
  cli: {
    version: pkgJson.version,
    rootDir: path.resolve(fileURLToPath(import.meta.url), '../../..'),
    templateDir: path.resolve(fileURLToPath(import.meta.url), '../../../template')
  },
  iosBundleIdentifier: '',
  androidPackageName: '',
  rootDir: '',
}
