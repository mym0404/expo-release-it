import { OptionHolder } from '../util/OptionHolder';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { setup } from '../util/setup/setup';
import { join } from '../util/FileUtil';
import { S } from '../util/setup/execShellScript';
import { spinner } from '../util/spinner';
import { getAndroidFastlaneOptions } from '../util/FastlaneOption';
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
  });
  await spinner('Fastlane', SS`bundle exec fastlane pull ${getAndroidFastlaneOptions()}`);
}

async function pullAndroidMetadata() {
  await prepareAndroid();
}
