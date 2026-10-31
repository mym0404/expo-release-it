import { copy, remove, resolve, write } from '../FileUtil';
import { copyAndroidMetadata, copyIosMetadata } from '../MetadataSyncUtil';
import { OptionHolder } from '../OptionHolder';
import { inspectRubyEnvironment, type RubyEnvironment } from './RubyEnvironment';

export async function prepareFastlane(environment?: RubyEnvironment) {
  const ruby = environment ?? (await inspectRubyEnvironment());
  await ruby.install();
  const platform = OptionHolder.input.platform;
  const fastlaneDir = resolve(ruby.workspace, 'fastlane');
  const fastfileName = 'Fastfile';
  remove(fastlaneDir);
  copy(
    resolve(OptionHolder.cli.templateDir, platform, 'fastlane', fastfileName),
    resolve(fastlaneDir, fastfileName),
  );
  write(resolve(ruby.workspace, '.gitignore'), '*\n');
  if (platform === 'ios') copyIosMetadata('workspace', ruby.workspace);
  else copyAndroidMetadata('workspace', ruby.workspace);
  return ruby;
}
