import type { ExpoReleaseItConfiguration } from '../type/ExpoReleaseItConfiguration';
import { OptionHolder } from './OptionHolder';
import { join, exist, readJsonSlow } from './FileUtil';
import { is } from '@mj-studio/js-util';

export async function parseConfigFile() {
  const candidates = [
    join(OptionHolder.resourcesDir, 'expo-release-it.config.json'),
    join(OptionHolder.projectDir, 'expo-release-it.config.json'),
  ];
  if (OptionHolder.input.config) {
    candidates.unshift(OptionHolder.input.config);
  }

  const validConfigFilePath = candidates.find(
    (candidate) => exist(candidate) && is.object(readJsonSlow(candidate)),
  );

  if (!validConfigFilePath) return;

  const config = readJsonSlow(validConfigFilePath) as ExpoReleaseItConfiguration;

  assignIfValueIsValidAndNotSetAlready(
    OptionHolder.input,
    'semverIncrement',
    config.bump?.increment,
  );
  assignIfValueIsValidAndNotSetAlready(
    OptionHolder.input,
    'androidOutput',
    config.build?.androidBuildOutput ?? config.upload?.androidBuildOutput,
  );
  assignIfValueIsValidAndNotSetAlready(
    OptionHolder.input,
    'uploadMetadata',
    config.upload?.uploadMetadata ?? config.submit?.uploadMetadata,
  );
  assignIfValueIsValidAndNotSetAlready(
    OptionHolder.input,
    'uploadScreenshot',
    config.upload?.uploadScreenshot ?? config.submit?.uploadScreenshot,
  );
  assignIfValueIsValidAndNotSetAlready(OptionHolder.input.git, 'commit', config.bump?.git?.commit);
  assignIfValueIsValidAndNotSetAlready(
    OptionHolder.input.git,
    'commitMessage',
    config.bump?.git?.commitMessage,
  );
  assignIfValueIsValidAndNotSetAlready(OptionHolder.input.git, 'tag', config.bump?.git?.tag);
  assignIfValueIsValidAndNotSetAlready(
    OptionHolder.input.git,
    'tagName',
    config.bump?.git?.tagName,
  );
  assignIfValueIsValidAndNotSetAlready(OptionHolder.input.git, 'push', config.bump?.git?.push);
}

// make sure config file options doesn't overwrite passed options from cli directly.
function assignIfValueIsValidAndNotSetAlready<R, T extends Record<K, R>, K extends keyof T>(
  object: Partial<T>,
  key: K,
  value: R,
) {
  if (!object[key] && !(value === null || value === undefined)) {
    object[key] = value as any;
  }
}
