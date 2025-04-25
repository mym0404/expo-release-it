import { OptionHolder } from '../OptionHolder';
import { select } from '@inquirer/prompts';
import { is } from '@mj-studio/js-util';

export const InqueryInputs = {
  platform: async () => {
    if (!OptionHolder.input.platform) {
      OptionHolder.input.platform = await select({
        message: 'Platform to release',
        choices: [
          { name: 'ios', value: 'ios', description: 'Release ios' },
          { name: 'android', value: 'android', description: 'Release android' },
        ],
      });
    }
  },
  podinstall: async () => {
    if (OptionHolder.input.platform === 'ios') {
      OptionHolder.input.pod = await select({
        message: 'Install Cocoapods',
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
          message: 'Android Output',
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
        message: 'Upload Metadata(screenshot, title, description, ...)',
        choices: [
          { name: 'yes', value: true, description: 'Upload' },
          { name: 'no', value: false, description: "Don't Upload" },
        ],
      });
    }
  },
};
