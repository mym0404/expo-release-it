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

  // make sure config file options doesn't overwrite passed options from cli directly.
  if (!OptionHolder.input.semverIncrement && config.bump?.increment) {
    OptionHolder.input.semverIncrement = config.bump?.increment;
  }
}
