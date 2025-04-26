import { OptionHolder } from '../util/OptionHolder';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { setup } from '../util/setup/setup';
import { join, copy } from '../util/FileUtil';
import { S } from '../util/setup/execShellScript';
import { prepareIos } from '../util/setup/prepareIos';
import { prepareAndroid } from '../util/setup/prepareAndroid';
import { generateAppStoreConnectApiKeyFile } from '../util/generateAppStoreConnectApiKeyFile';

export async function pull({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);
  await setup();
  await promptInputs();

  if (OptionHolder.input.platform === 'ios') {
    await pullIosMetadata();
  } else {
    await pullAndroidMetadata();
  }
}

async function promptInputs() {
  await InqueryInputs.platform();
}

async function pullIosMetadata() {
  await prepareIos();
  const iosDir = join(OptionHolder.projectDir, 'ios');
  console.log(iosDir);
  const SS = S({
    cwd: iosDir,
    env: {
      MATCH_PASSWORD: OptionHolder.keyholderMap.ios_match_password,
    },
  });
  await SS`bundle exec fastlane deliver download_metadata --api_key_path ${generateAppStoreConnectApiKeyFile()}`;
  await SS`bundle exec fastlane deliver download_screenshots --api_key_path ${generateAppStoreConnectApiKeyFile()}`;

  const metadataSrcDir = join(iosDir, 'fastlane/metadata');
  const screenshotsSrcDir = join(iosDir, 'fastlane/screenshots');

  const metadataDestDir = join(OptionHolder.outputOfInitDir, 'metadata/ios/metadata');
  const screenshotsDestDir = join(OptionHolder.outputOfInitDir, 'metadata/ios/screenshots');

  copy(metadataSrcDir, metadataDestDir);
  copy(screenshotsSrcDir, screenshotsDestDir);
}

async function pullAndroidMetadata() {
  await prepareAndroid();
}
