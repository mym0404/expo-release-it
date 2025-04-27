import { OptionHolder } from '../util/OptionHolder';
import { logger } from '../util/logger';
import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import { copy, join, writeJson } from '../util/FileUtil';
import { constructInquirerFormattedMessage } from '../util/input/InqueryInputs';
import { setup } from '../util/setup/setup';

export async function init({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);

  logger.info(`${chalk.inverse('expo-release-it')} Initialization Get Started`);

  await setup();
  await promptInputs();
  await copyTemplates();

  logger.success(
    `${chalk.inverse('expo-release-it')} Initialization Done. Check out generated 'expo-release-it' directory.`,
  );
}

async function promptInputs() {
  /* ios */
  OptionHolder.keyholderMap.ios_app_identifier = await input({
    message: constructInquirerFormattedMessage({
      name: 'iOS Bundle Identifier',
      explanation: `The bundle identifier for your iOS standalone app. You make it up, but it needs to be unique on the App Store.
This means 'CFBundleIdentifier' in info.plist and 'ios.bundleIdentifier' in expo app config`,
      example: 'com.companyname.appname',
      referUrl: 'https://docs.expo.dev/versions/latest/config/app/#bundleidentifier',
    }),
    required: true,
    default: OptionHolder.keyholderMap.ios_app_identifier,
  });

  OptionHolder.keyholderMap.ios_developer_team_id = await input({
    message: constructInquirerFormattedMessage({
      name: 'IOS Developer Team Id',
      explanation: `A unique alphanumeric string that identifies your Apple Developer Team`,
      example: '8A51ABC4H7',
      referUrl: 'https://developer.apple.com/account',
    }),
    required: true,
    default: OptionHolder.keyholderMap.ios_developer_team_id,
  });

  OptionHolder.keyholderMap.ios_match_git_url = await input({
    message: constructInquirerFormattedMessage({
      name: 'iOS Fastlane Match Github URL',
      explanation: `The URL of the private Git repository where code signing certificates and profiles are stored for Fastlane Match.`,
      example: 'https://github.com/yourname/your-certificates-repo.git',
      referUrl: 'https://docs.fastlane.tools/actions/match/',
    }),
    required: true,
    default: OptionHolder.keyholderMap.ios_match_git_url,
  });

  OptionHolder.keyholderMap.ios_match_password = await input({
    message: constructInquirerFormattedMessage({
      name: 'iOS Fastlane Match Passphrase',
      explanation: `When running match for the first time on a new machine, it will ask you for the passphrase for the Git repository. This is an additional layer of security: each of the files will be encrypted using openssl. Make sure to remember the password, as you'll need it when you run match on a different machine.`,
      example: 'yourpassphrase',
      referUrl: 'https://docs.fastlane.tools/actions/match/',
    }),
    required: true,
    default: OptionHolder.keyholderMap.ios_match_password,
  });

  OptionHolder.keyholderMap.ios_app_store_connect_api_key_id = await input({
    message: constructInquirerFormattedMessage({
      name: 'iOS App Store Connect API Key ID',
      explanation: `ID of App Store Connect API key, used for authentication with Apple’s API.
App Store Connect API Key can be issued in ${chalk.underline.blue('https://appstoreconnect.apple.com/access/integrations/api')}`,
      example: '1A2BC3DE4F',
      referUrl: 'https://appstoreconnect.apple.com/access/integrations/api',
    }),
    required: true,
    default: OptionHolder.keyholderMap.ios_app_store_connect_api_key_id,
  });

  OptionHolder.keyholderMap.ios_app_store_connect_api_key_issuer_id = await input({
    message: constructInquirerFormattedMessage({
      name: 'iOS App Store Connect API Key Issuer ID',
      explanation: `Identifies the issuer who created the authentication token.
App Store Connect API Key can be issued in ${chalk.underline.blue('https://appstoreconnect.apple.com/access/integrations/api')}`,
      example: 'abcd1234-5678-90ef-ghij-1234567890kl',
      referUrl: 'https://appstoreconnect.apple.com/access/integrations/api',
    }),
    required: true,
    default: OptionHolder.keyholderMap.ios_app_store_connect_api_key_issuer_id,
  });

  OptionHolder.keyholderMap.ios_xcode_project_target = await input({
    message: constructInquirerFormattedMessage({
      name: 'iOS App Target Name',
      explanation: `A target in Xcode defines a product to build, including app, extension, or framework, with its own settings and build instructions.
Usually, this is equivalent to {{name}}.xcodeproj in your ios directory`,
      example: 'app',
    }),
    required: true,
    default: OptionHolder.keyholderMap.ios_xcode_project_target || 'app',
  });

  /* android */
  OptionHolder.keyholderMap.android_package_name = await input({
    message: constructInquirerFormattedMessage({
      name: 'Android Package Name',
      explanation: `The package name for your Android standalone app. You make it up, but it needs to be unique on the Play Store.`,
      example: 'com.companyname.appname',
      referUrl: 'https://docs.expo.dev/versions/latest/config/app/#package',
    }),
    required: true,
    default: OptionHolder.keyholderMap.android_package_name,
  });
  OptionHolder.keyholderMap.android_keystore_store_password = await input({
    message: constructInquirerFormattedMessage({
      name: 'Android Keystore Store Password',
      explanation: `Storage password used in android release keystore
You can issue your android release keystore following this guide: ${chalk.underline.blue('https://developer.android.com/studio/publish/app-signing.html#generate-key')}
Or, you can do same thing with CLI: ${chalk.underline.blue('https://gist.github.com/henriquemenezes/70feb8fff20a19a65346e48786bedb8f')}`,
      referUrl: 'https://developer.android.com/studio/publish/app-signing.html#generate-key',
    }),
    required: true,
    default: OptionHolder.keyholderMap.android_keystore_store_password,
  });
  OptionHolder.keyholderMap.android_keystore_key_alias = await input({
    message: constructInquirerFormattedMessage({
      name: 'Android Keystore Key Alias',
      explanation: `Key alias used in android release keystore
You can issue your android release keystore following this guide: ${chalk.underline.blue('https://developer.android.com/studio/publish/app-signing.html#generate-key')}
Or, you can do same thing with CLI: ${chalk.underline.blue('https://gist.github.com/henriquemenezes/70feb8fff20a19a65346e48786bedb8f')}`,
      referUrl: 'https://developer.android.com/studio/publish/app-signing.html#generate-key',
    }),
    required: true,
    default: OptionHolder.keyholderMap.android_keystore_key_alias,
  });
  OptionHolder.keyholderMap.android_keystore_key_password = await input({
    message: constructInquirerFormattedMessage({
      name: 'Android Keystore Key Password',
      explanation: `Key password used in android release keystore
You can issue your android release keystore following this guide: ${chalk.underline.blue('https://developer.android.com/studio/publish/app-signing.html#generate-key')}
Or, you can do same thing with CLI: ${chalk.underline.blue('https://gist.github.com/henriquemenezes/70feb8fff20a19a65346e48786bedb8f')}`,
      referUrl: 'https://developer.android.com/studio/publish/app-signing.html#generate-key',
    }),
    required: true,
    default: OptionHolder.keyholderMap.android_keystore_key_password,
  });

  writeJson(OptionHolder.keyholderFilePath, OptionHolder.keyholderMap);
}

async function copyTemplates() {
  for (const dir of OptionHolder.templateDirNames) {
    await copyDirRecursively(dir);
  }

  async function copyDirRecursively(dir: string) {
    const sourceDirPath = join(OptionHolder.cli.templateDir, dir);
    const destDirPath = join(OptionHolder.resourcesDir, dir);
    // don't overwirte key
    copy(sourceDirPath, destDirPath, { overwrite: dir !== 'key' });
  }
}
