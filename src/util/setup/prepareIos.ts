import { $, spinner } from 'zx';
import { remove, resolve, iterateDir, copy } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { logger } from '../logger';
import { injectTemplatePlaceHolders } from '../injectTemplatePlaceHolders';

export async function prepareIos() {
  const srcDir = resolve(OptionHolder.cli.templateDir, 'ios');
  const destDir = resolve(OptionHolder.projectDir, 'ios');

  await spinner(
    'Prebuild iOS',
    () => $`cd ${OptionHolder.projectDir} && expo prebuild -p ios --no-install`,
  );
  logger.success('expo prebuild');

  await iterateDir(srcDir, async (file) => {
    const filePath = resolve(srcDir, file);
    remove(resolve(destDir, file));
    copy(filePath, resolve(destDir, file));
  });
  logger.success('Inject iOS templates');

  await injectTemplatePlaceHolders(resolve(destDir, 'fastlane'));
  logger.success('Hydrate template placeholders');
}
