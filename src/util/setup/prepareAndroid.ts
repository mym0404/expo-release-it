import { copy, exist, read, resolve, write } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';

export function androidSigningEnvironment() {
  const keys = OptionHolder.keyholderMap;
  const keystore = resolve(OptionHolder.keyDir, 'android_release.keystore');
  if (!exist(keystore)) throw new Error(`Android release keystore is missing: ${keystore}`);
  const values = {
    EXPO_RELEASE_IT_KEYSTORE: keystore,
    EXPO_RELEASE_IT_STORE_PASSWORD: keys.android_keystore_store_password,
    EXPO_RELEASE_IT_KEY_ALIAS: keys.android_keystore_key_alias,
    EXPO_RELEASE_IT_KEY_PASSWORD: keys.android_keystore_key_password,
  };
  if (Object.values(values).some((value) => !value)) {
    throw new Error(
      'Android release signing requires the keystore store password, key alias, and key password in keyholder.json.',
    );
  }
  return values;
}

export async function prepareAndroid(prebuild: () => Promise<void>) {
  await prebuild();
  const appDir = resolve(OptionHolder.projectDir, 'android', 'app');
  const buildGradle = resolve(appDir, 'build.gradle');
  if (!exist(buildGradle))
    throw new Error(
      'Generated android/app/build.gradle was not found. This Expo template needs a signing integration update.',
    );
  copy(
    resolve(OptionHolder.cli.templateDir, 'android', 'release-signing.gradle'),
    resolve(appDir, 'expo-release-it-signing.gradle'),
  );
  write(buildGradle, `${read(buildGradle)}\napply from: file("expo-release-it-signing.gradle")\n`);
}
