import { join, relativePath, copy } from './FileUtil';
import { OptionHolder } from './OptionHolder';
import { logger } from './logger';
import chalk from 'chalk';

export function copyIosMetadata(to: 'resources' | 'native') {
  const iosDir = join(OptionHolder.projectDir, 'ios');

  const nativeDir = join(iosDir, 'fastlane');
  const metadataNativeDir = join(nativeDir, 'metadata');
  const screenshotsNativeDir = join(nativeDir, 'screenshots');

  const resourcesDir = join(OptionHolder.resourcesDir, 'metadata/ios');
  const metadataResourcesDir = join(resourcesDir, 'metadata');
  const screenshotsResourcesDir = join(resourcesDir, 'screenshots');

  if (to === 'resources') {
    copy(metadataNativeDir, metadataResourcesDir);
    copy(screenshotsNativeDir, screenshotsResourcesDir);

    logger.done(
      `iOS Metadata saved in ${chalk.inverse(relativePath(OptionHolder.projectDir, resourcesDir))}. You can edit inside contents.`,
    );
  } else {
    copy(metadataResourcesDir, metadataNativeDir);
    copy(screenshotsResourcesDir, screenshotsNativeDir);

    logger.done(
      `iOS Metadata copyed to ${chalk.inverse(relativePath(OptionHolder.projectDir, nativeDir))}`,
    );
  }
}

export function copyAndroidMetadata(to: 'resouces' | 'native') {
  const androidDir = join(OptionHolder.projectDir, 'android');

  const nativeDir = join(androidDir, 'fastlane/metadata/android');
  const resourcesDir = join(OptionHolder.resourcesDir, 'metadata/android');

  if (to === 'resouces') {
    copy(nativeDir, resourcesDir);
    logger.done(
      `Android Metadata saved in ${chalk.inverse(relativePath(OptionHolder.projectDir, resourcesDir))}. You can edit inside contents.`,
    );
  } else {
    copy(resourcesDir, nativeDir);
    logger.done(
      `Android Metadata copyed to ${chalk.inverse(relativePath(OptionHolder.projectDir, nativeDir))}`,
    );
  }
}
