import { OptionHolder } from '../util/OptionHolder';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { setup } from '../util/setup/setup';
import { join } from '../util/FileUtil';
import { S } from '../util/setup/execShellScript';
import { getIosFastlaneOptions } from '../util/FastlaneOption';
import { prepareIos } from '../util/setup/prepareIos';
import { prepareAndroid } from '../util/setup/prepareAndroid';

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
  await SS`bundle exec fastlane pull ${getIosFastlaneOptions()}`;
}

async function pullAndroidMetadata() {
  await prepareAndroid();
}
