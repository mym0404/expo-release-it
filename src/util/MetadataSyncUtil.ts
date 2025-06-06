import chalk from 'chalk';
import { copy, exist, join, relativePath } from './FileUtil';
import { OptionHolder } from './OptionHolder';
import { logger } from './logger';

export function copyIosMetadata(to: 'resources' | 'native') {
  const iosDir = join(OptionHolder.projectDir, 'ios');

  const nativeDir = join(iosDir, 'fastlane');
  const metadataNativeDir = join(nativeDir, 'metadata');
  const screenshotsNativeDir = join(nativeDir, 'screenshots');

  const resourcesDir = join(OptionHolder.resourcesDir, 'metadata/ios');
  const metadataResourcesDir = join(resourcesDir, 'metadata');
  const screenshotsResourcesDir = join(resourcesDir, 'screenshots');

  if (to === 'resources') {
    if (exist(metadataNativeDir) && exist(screenshotsNativeDir)) {
      copy(metadataNativeDir, metadataResourcesDir);
      copy(screenshotsNativeDir, screenshotsResourcesDir);

      logger.done(
        `iOS Metadata saved in ${chalk.inverse(relativePath(OptionHolder.projectDir, resourcesDir))}. You can edit inside contents.`,
      );
    } else {
      logger.warn(
        `iOS Metadata not found in ${chalk.inverse(relativePath(OptionHolder.projectDir, nativeDir))}`,
      );
    }
  } else {
    if (exist(metadataResourcesDir) && exist(screenshotsResourcesDir)) {
      copy(metadataResourcesDir, metadataNativeDir);
      copy(screenshotsResourcesDir, screenshotsNativeDir);

      logger.done(
        `iOS Metadata copyed to ${chalk.inverse(relativePath(OptionHolder.projectDir, nativeDir))}`,
      );
    } else {
      logger.warn(
        `iOS Metadata not found in ${chalk.inverse(relativePath(OptionHolder.projectDir, resourcesDir))}`,
      );
    }
  }
}

export function copyAndroidMetadata(to: 'resouces' | 'native') {
  const androidDir = join(OptionHolder.projectDir, 'android');

  const nativeDir = join(androidDir, 'fastlane/metadata/android');
  const resourcesDir = join(OptionHolder.resourcesDir, 'metadata/android');

  if (to === 'resouces') {
    if (exist(nativeDir)) {
      copy(nativeDir, resourcesDir);
      logger.done(
        `Android Metadata saved in ${chalk.inverse(relativePath(OptionHolder.projectDir, resourcesDir))}. You can edit inside contents.`,
      );
    } else {
      logger.warn(
        `Android Metadata not found in ${chalk.inverse(relativePath(OptionHolder.projectDir, nativeDir))}`,
      );
    }
  } else {
    if (exist(resourcesDir)) {
      copy(resourcesDir, nativeDir);
      logger.done(
        `Android Metadata copyed to ${chalk.inverse(relativePath(OptionHolder.projectDir, nativeDir))}`,
      );
    } else {
      logger.warn(
        `Android Metadata not found in ${chalk.inverse(relativePath(OptionHolder.projectDir, resourcesDir))}`,
      );
    }
  }
}
