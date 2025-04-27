import type { ExpoConfig, ConfigContext } from 'expo/config';

const VERSION_NAME = '1.2.3'; // VERSION_NAME variable is required.
const VERSION_CODE = 1002003; // VERSION_CODE variable is required.

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    version: VERSION_NAME,
    ios: {
      buildNumber: VERSION_CODE + '',
    },
    android: {
      versionCode: VERSION_CODE,
    },
  };
};
