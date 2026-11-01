import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { OptionHolder } from '../build/util/OptionHolder.js';
import { inspectRubyEnvironment } from '../build/util/setup/RubyEnvironment.js';

const directory = await mkdtemp(join(tmpdir(), 'expo-release-it-ruby-'));
const originalEnv = { ...process.env };
try {
  const gemfile = 'source "https://invalid.example"\ngem "do_not_resolve_user_gems"\n';
  const lockfile = '# user lockfile must remain unchanged\n';
  await writeFile(join(directory, 'Gemfile'), gemfile);
  await writeFile(join(directory, 'Gemfile.lock'), lockfile);
  const userConfig = join(directory, '.bundle', 'config');
  const config = '---\nBUNDLE_PATH: /invalid/user/gems\n';
  await mkdir(join(directory, '.bundle'));
  await writeFile(userConfig, config);
  await writeFile(join(directory, 'bundle'), '#!/bin/sh\nexit 99\n');
  await chmod(join(directory, 'bundle'), 0o755);
  process.env.PATH = `${directory}:${process.env.PATH}`;
  process.env.BUNDLE_GEMFILE = join(directory, 'Gemfile');
  process.env.BUNDLE_PATH = join(directory, 'user-bundle');
  process.env.BUNDLE_FROZEN = 'false';
  OptionHolder.projectDir = directory;
  OptionHolder.resourcesDir = join(directory, 'expo-release-it');
  OptionHolder.input.platform = 'ios';
  OptionHolder.cli.templateDir = resolve('template');
  const ruby = await inspectRubyEnvironment({ needsPods: true });
  await ruby.install();
  const installedLock = await readFile(join(ruby.directory, 'Gemfile.lock'), 'utf8');
  const bundler = await ruby.bundle(['--version'], { cwd: directory, capture: true });
  assert.ok(bundler.stdout.includes(ruby.bundlerVersion));
  const fastlane = await ruby.bundle(['exec', 'fastlane', '--version'], {
    cwd: directory,
    capture: true,
  });
  assert.match(fastlane.stdout, /fastlane 2\.227\.1/);
  const pods = await ruby.bundle(['exec', 'pod', '--version'], { cwd: directory, capture: true });
  assert.match(pods.stdout, /1\.16\.2/);
  await ruby.bundle(
    [
      'exec',
      ruby.executable,
      '-e',
      `require "fastlane"
Fastlane.load_actions
require "fastlane/actions/update_code_signing_settings"
require "xcodeproj"
project_path = File.join(Dir.pwd, "SigningFixture.xcodeproj")
project = Xcodeproj::Project.new(project_path)
target = project.new_target(:application, "DifferentAppTarget", :ios, "15.1")
project.root_object.attributes["TargetAttributes"] = {}
debug_configuration = "Debug"
release_configuration = "Release"
signing_style = "CODE_SIGN_STYLE"
signing_identity = "CODE_SIGN_IDENTITY"
team_setting = "DEVELOPMENT_TEAM"
release_team = "RELEASETEAM"
distribution_identity = "Apple Distribution"
target.build_configurations.each do |config|
  config.build_settings[signing_style] = "Automatic"
  config.build_settings[signing_identity] = "Apple Development"
  config.build_settings[team_setting] = "DEBUGTEAM"
end
project.save
debug_before = target.build_configurations.find { |config| config.name == debug_configuration }.build_settings.dup
fastfile = Fastlane::FastFile.new(ARGV.fetch(0))
fastfile.define_singleton_method(:authenticate) { |_| }
fastfile.define_singleton_method(:setup_ci) {}
fastfile.define_singleton_method(:match) { |_| }
fastfile.define_singleton_method(:update_code_signing_settings) do |options|
  Fastlane::Actions::UpdateCodeSigningSettingsAction.run(options)
end
fastfile.define_singleton_method(:update_project_provisioning) do |options|
  raise "Provisioning must select Release" unless options[:build_configuration] == release_configuration
end
fastfile.runner.lanes[:ios][:sign].call(
  project: project_path, target: target.name, ios_developer_team_id: release_team
)
settings = Xcodeproj::Project.open(project_path).targets.first.build_configurations
raise "Debug signing changed" unless settings.find { |config| config.name == debug_configuration }.build_settings == debug_before
release = settings.find { |config| config.name == release_configuration }.build_settings
raise "Release signing missing" unless release[signing_style] == "Manual" && release[signing_identity] == distribution_identity && release[team_setting] == release_team
`,
      resolve('template/ios/fastlane/Fastfile'),
    ],
    { cwd: directory, capture: true },
  );
  assert.equal(await readFile(join(directory, 'Gemfile'), 'utf8'), gemfile);
  assert.equal(await readFile(join(directory, 'Gemfile.lock'), 'utf8'), lockfile);
  assert.equal(await readFile(userConfig, 'utf8'), config);
  assert.equal(await readFile(join(ruby.directory, 'Gemfile.lock'), 'utf8'), installedLock);
  console.log(
    `Ruby ${ruby.version}: pinned Bundler, Fastlane, CocoaPods and Release-only signing passed; user Gemfiles unchanged.`,
  );
} finally {
  process.env = originalEnv;
  await rm(directory, { recursive: true, force: true });
}
