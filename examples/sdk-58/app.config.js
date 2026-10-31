const VERSION_NAME = '1.0.0';
const VERSION_CODE = 1;

module.exports = {
  name: 'ReleaseSdk58',
  slug: 'release-sdk-58',
  newArchEnabled: true,
  version: VERSION_NAME,
  ios: {
    buildNumber: String(VERSION_CODE),
    bundleIdentifier: 'net.mjstudio.release.sdk58',
  },
  android: {
    versionCode: VERSION_CODE,
    package: 'net.mjstudio.release.sdk58',
  },
};
