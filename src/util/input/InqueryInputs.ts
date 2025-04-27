import { OptionHolder } from '../OptionHolder';
import { select } from '@inquirer/prompts';
import { is } from '@mj-studio/js-util';
import chalk from 'chalk';

export const InqueryInputs = {
  platform: async () => {
    if (!OptionHolder.input.platform) {
      OptionHolder.input.platform = await select({
        message: constructInquirerFormattedMessage({
          name: 'Platform',
          explanation: `Platform to run action`,
        }),
        choices: [
          { name: 'ios', value: 'ios', description: 'Release ios' },
          { name: 'android', value: 'android', description: 'Release android' },
        ],
      });
    }
  },
  platformAll: async () => {
    if (!OptionHolder.input.platformAll) {
      OptionHolder.input.platformAll = await select({
        message: constructInquirerFormattedMessage({
          name: 'Platform',
          explanation: `Platforms to run action`,
        }),
        choices: [
          { name: 'all', value: 'all', description: 'Both' },
          { name: 'ios', value: 'ios', description: 'Release ios' },
          { name: 'android', value: 'android', description: 'Release android' },
        ],
      });
    }
  },
  podinstall: async () => {
    if (OptionHolder.input.platform === 'ios') {
      OptionHolder.input.pod = await select({
        message: constructInquirerFormattedMessage({
          name: 'Install CocoaPods?',
        }),
        choices: [
          { name: 'yes', value: true, description: 'Install pods before release' },
          { name: 'no', value: false, description: 'Skip pods install' },
        ],
      });
    }
  },
  androidBuildOutput: async () => {
    if (OptionHolder.input.platform === 'android') {
      if (!OptionHolder.input.androidOutput) {
        OptionHolder.input.androidOutput = await select({
          message: constructInquirerFormattedMessage({
            name: 'Android output artifact type',
          }),
          choices: [
            { name: 'aab', value: 'aab', description: 'Build as App bundle' },
            { name: 'apk', value: 'apk', description: 'Build as APK' },
          ],
        });
      }
    }
  },
  uploadMetadata: async () => {
    if (!is.boolean(OptionHolder.input.uploadMetadata)) {
      OptionHolder.input.uploadMetadata = await select({
        message: constructInquirerFormattedMessage({
          name: 'Upload Metadata(screenshot, title, description, ...)',
        }),
        choices: [
          { name: 'yes', value: true, description: 'Upload' },
          { name: 'no', value: false, description: "Don't Upload" },
        ],
      });
    }
  },
  useLiveVersionIos: async () => {
    if (
      !is.boolean(OptionHolder.input.useLiveVersionIos) &&
      OptionHolder.input.platform === 'ios'
    ) {
      OptionHolder.input.useLiveVersionIos = await select({
        message: constructInquirerFormattedMessage({
          name: 'Download metadatas from live version rather than draft',
        }),
        choices: [
          { name: 'yes', value: true, description: 'Download from live version' },
          { name: 'no', value: false, description: 'Download from draft' },
        ],
      });
    }
  },
};

export function constructInquirerFormattedMessage({
  example,
  explanation,
  referUrl,
  name,
}: {
  name: string;
  explanation?: string;
  example?: string;
  referUrl?: string;
}) {
  let ret = `${chalk.bold(name)}`;
  if (explanation) {
    ret += `\n\n${chalk.italic.blue(explanation)}`;
  }
  if (example) {
    ret += `\n${chalk.italic(`${chalk.greenBright('example    :')} ${example}`)}`;
  }
  if (referUrl) {
    ret += `\n${chalk.italic(`${chalk.greenBright('references :')} ${chalk.underline.blue(referUrl)}`)}`;
  }

  if (explanation) {
    ret += '\n';
    if (example || referUrl) {
      ret += '\n';
    }
  }

  return ret;
}
