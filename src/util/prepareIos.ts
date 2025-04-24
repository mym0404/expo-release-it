import { $, spinner } from 'zx';
import { remove, resolve, iterateDir, copy } from './FileUtil';
import { OptionHolder } from './OptionHolder';
import { logger } from './logger';

export async function prepareIos() {
  const iosDir = resolve(OptionHolder.rootDir, 'ios');
  const fastlaneSrcDir = resolve(OptionHolder.rootDir, 'fastlane-ios');
  const fastlaneDestDir = resolve(OptionHolder.rootDir, 'ios', 'fastlane');

  await spinner(
    'Prebuild iOS',
    () => $`cd ${OptionHolder.rootDir} && expo prebuild -p ios --no-install`,
  );

  remove(fastlaneDestDir);

  await iterateDir(fastlaneSrcDir, async (file) => {
    const filePath = resolve(fastlaneSrcDir, file);
    remove(resolve(iosDir, file));
    copy(filePath, resolve(iosDir, file));
  });

  logger.success('Inject iOS Fastlane files');
}
