import { remove, resolve, iterateDir, copy } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { injectTemplatePlaceHolders } from '../injectTemplatePlaceHolders';
import { spinner } from '../spinner';
import { exe, yesShell } from './execShellScript';
import { logger } from '../logger';

export async function prepareIos() {
  const srcDir = resolve(OptionHolder.cli.templateDir, 'ios');
  const destDir = resolve(OptionHolder.projectDir, 'ios');
  await spinner(
    'Expo Prebuild',
    yesShell(`expo prebuild -p ios --no-install`, {
      cwd: OptionHolder.projectDir,
    }),
  );

  await spinner(
    'Inject templates',
    iterateDir(srcDir, async (file) => {
      const filePath = resolve(srcDir, file);
      remove(resolve(destDir, file));
      copy(filePath, resolve(destDir, file));
    }),
  );

  await spinner(
    'Hydrate template placeholders',
    injectTemplatePlaceHolders(resolve(destDir, 'fastlane')),
  );

  await exe({ cwd: destDir })`bundle install`;
  logger.success('Bunder Install - Done');
}
