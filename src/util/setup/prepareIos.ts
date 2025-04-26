import { remove, resolve, iterateDir, copy } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { injectTemplatePlaceHolders } from '../injectTemplatePlaceHolders';
import { spinner } from '../spinner';
import { S } from './execShellScript';

export async function prepareIos() {
  const srcDir = resolve(OptionHolder.cli.templateDir, 'ios');
  const destDir = resolve(OptionHolder.projectDir, 'ios');

  await spinner(
    'Expo Prebuild',
    S`cd ${OptionHolder.projectDir} && expo prebuild -p ios --no-install`,
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

  await spinner('Bundler Install', S`cd ${destDir} && bundle install`);
}
