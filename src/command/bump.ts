import { select } from '@inquirer/prompts';
import { is } from '@mj-studio/js-util';
import semver from 'semver';
import { isDev } from '../util/EnvUtil';
import { constructInquirerFormattedMessage } from '../util/input/InqueryInputs';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { exe } from '../util/setup/execShellScript';
import { setup } from '../util/setup/setup';
import {
  checkVersionCodeIsTiedWithVersionName,
  generateVersionCodeTiedWithVersionName,
  injectBinaryVersions,
} from '../util/setup/VersionUtil';
import { throwError } from '../util/throwError';

export async function bump({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);
  await preCheck();
  await setup();

  const nextVersionName = semver.inc(OptionHolder.versionName, OptionHolder.input.semverIncrement)!;
  const nextVersionCode = (() => {
    if (checkVersionCodeIsTiedWithVersionName(OptionHolder.versionName, OptionHolder.versionCode)) {
      return generateVersionCodeTiedWithVersionName(nextVersionName);
    } else {
      logger.warn(
        'version name is not tied with version code like (1.3.5=1003005). Version code is just incremented by 1.',
      );
      return `${Number(OptionHolder.versionCode) + 1}`;
    }
  })();

  logger.info(`Next Version: ${nextVersionName}(${nextVersionCode})`);

  await injectBinaryVersions({ versionName: nextVersionName, versionCode: nextVersionCode });
  logger.success('Binary versions have been bumped in expo config file');

  await processCommit({ nextVersionName, nextVersionCode });
  if (OptionHolder.input.git.commit) {
    await promptTagAndPush({ nextVersionName, nextVersionCode });
  }
}

async function preCheck() {
  if (isDev) return;
  try {
    let hasChange = false;
    try {
      await exe('git', ['diff', '--quiet', 'HEAD']);
    } catch (_) {
      hasChange = true;
    }
    if (hasChange) {
      throwError('Workspace is not clean. Before bump version, you should commit all changes.');
    }
  } catch (e) {
    throwError('Precheck Failed', e);
  }
}

async function processCommit({
  nextVersionCode,
  nextVersionName,
}: {
  nextVersionName: string;
  nextVersionCode: string;
}) {
  if (!is.boolean(OptionHolder.input.git.commit)) {
    OptionHolder.input.git.commit = await select({
      message: constructInquirerFormattedMessage({ name: 'Commit?' }),
      choices: [
        { name: 'yes', value: true },
        { name: 'no', value: false },
      ],
    });
  }
  if (!is.notEmptyString(OptionHolder.input.git.commitMessage)) {
    OptionHolder.input.git.commitMessage = 'chore: release $(version) 🚀';
  }

  if (OptionHolder.input.git.commit) {
    await exe('git', ['add', '--all']);
    await exe('git', [
      'commit',
      '-m',
      OptionHolder.input.git.commitMessage!.replaceAll(
        '$(version)',
        `${nextVersionName}(${nextVersionCode})`,
      ),
    ]);
  }
}

async function promptTagAndPush({
  nextVersionCode,
  nextVersionName,
}: {
  nextVersionName: string;
  nextVersionCode: string;
}) {
  if (!is.boolean(OptionHolder.input.git.tag)) {
    OptionHolder.input.git.tag = await select({
      message: constructInquirerFormattedMessage({ name: 'Tag?' }),
      choices: [
        { name: 'yes', value: true },
        { name: 'no', value: false },
      ],
    });
  }
  if (!is.notEmptyString(OptionHolder.input.git.tagName)) {
    OptionHolder.input.git.tagName = 'v$(version)';
  }

  const tagName = OptionHolder.input.git.tagName!.replaceAll(
    '$(version)',
    `${nextVersionName}(${nextVersionCode})`,
  );

  if (OptionHolder.input.git.tag) {
    await exe('git', ['tag', '-a', tagName, '-m', tagName]);
  }

  if (!is.boolean(OptionHolder.input.git.push)) {
    OptionHolder.input.git.push = await select({
      message: constructInquirerFormattedMessage({ name: 'Push?' }),
      choices: [
        { name: 'yes', value: true },
        { name: 'no', value: false },
      ],
    });
  }

  if (OptionHolder.input.git.push) {
    if (OptionHolder.input.git.tag) {
      await exe('git', ['push', 'origin', tagName]);
    }
    await exe('git', ['push']);
  }
}
