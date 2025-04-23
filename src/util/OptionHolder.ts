import pkgJson from "../../package.json";

export type ProgramOptions = {
  rootDir?: string;
}

export const OptionHolder: {
  cli: {version: string};
  iosBundleIdentifier: string;
  androidPackageName: string;
} & Required<ProgramOptions> = {
  cli: {
    version: pkgJson.version
  },
  iosBundleIdentifier: '',
  androidPackageName: '',
  rootDir: '',
}
