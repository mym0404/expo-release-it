import { $, spinner } from 'zx';
import { remove, resolve, iterateDir, copy } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { logger } from '../logger';

export async function prepareIos() {
  const iosDir = resolve(OptionHolder.projectDir, 'ios');
  const fastlaneSrcDir = resolve(OptionHolder.outputOfInitDir, 'fastlane-ios');
  const fastlaneDestDir = resolve(OptionHolder.projectDir, 'ios', 'fastlane');

  await spinner(
    'Prebuild iOS',
    () => $`cd ${OptionHolder.projectDir} && expo prebuild -p ios --no-install`,
  );

  remove(fastlaneDestDir);

  await iterateDir(fastlaneSrcDir, async (file) => {
    const filePath = resolve(fastlaneSrcDir, file);
    remove(resolve(iosDir, file));
    copy(filePath, resolve(iosDir, file));
  });

  logger.success('Inject iOS Fastlane files');
}
