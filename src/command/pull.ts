import { OptionHolder } from '../util/OptionHolder';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { setup } from '../util/setup/setup';
import { join } from '../util/FileUtil';
import { generateAppStoreConnectApiKeyFile } from '../util/generateAppStoreConnectApiKeyFile';
import { S } from '../util/setup/execShellScript';

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
  const iosDir = join(OptionHolder.projectDir, 'ios');
  console.log(iosDir);
  const SS = S({
    cwd: iosDir,
    env: {
      APP_STORE_CONNECT_API_KEY_PATH: generateAppStoreConnectApiKeyFile(),
    },
  });
  await SS`bundle exec fastlane deliver download_metadata ${[
    `app-identifier ${OptionHolder.iosBundleIdentifier},`,
    `team_id ${OptionHolder.keyholderMap.ios_developer_team_id}`,
  ]}`;
}

async function pullAndroidMetadata() {}
