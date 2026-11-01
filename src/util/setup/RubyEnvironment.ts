import { dirname } from 'node:path';

import { execa } from 'execa';
import semver from 'semver';

import { credentialProcessEnvironment } from '../CredentialVault';
import { copy, read, resolve, write } from '../FileUtil';
import { logger, redact } from '../logger';
import { OptionHolder } from '../OptionHolder';
import { printRedactedOutput } from './execShellScript';

export const rubyRequirement = '>=3.3.0 <4.1.0';
const gemfileName = 'Gemfile';
const lockfileName = 'Gemfile.lock';
const bundleLauncher =
  'version = ARGV.shift; gem "bundler", version; load Gem.bin_path("bundler", "bundle", version)';

export function rubyProcessEnvironment() {
  return Object.fromEntries(
    Object.entries(credentialProcessEnvironment()).filter(
      ([key]) => !key.startsWith('BUNDLE_') && !['RUBYOPT', 'RUBYLIB'].includes(key),
    ),
  );
}

export async function inspectRubyEnvironment({ needsPods = false } = {}) {
  const sourceDir = resolve(OptionHolder.cli.templateDir, 'ruby');
  const lockfile = read(resolve(sourceDir, lockfileName));
  const bundlerVersion = /BUNDLED WITH\s+([\d.]+)/.exec(lockfile)?.[1] ?? '';
  if (!bundlerVersion) throw new Error('The packaged Gemfile.lock has no Bundler version.');

  const env = rubyProcessEnvironment();
  const probe = await execa(
    'ruby',
    [
      '-rjson',
      '-rrbconfig',
      '-e',
      'v = ARGV.first; s = Gem::Specification.find_all_by_name("bundler", v).first; puts JSON.generate(ruby: RbConfig.ruby, version: RUBY_VERSION, engine: RUBY_ENGINE, platform: Gem::Platform.local.to_s, bundle: s && Gem.bin_path("bundler", "bundle", v))',
      bundlerVersion,
    ],
    { cwd: OptionHolder.projectDir, env, extendEnv: false, reject: false },
  );
  if (probe.failed) {
    throw new Error(
      `Ruby from PATH could not be inspected. Required: MRI Ruby ${rubyRequirement} and Bundler ${bundlerVersion}. Activate your prepared Ruby environment, then rerun.`,
    );
  }
  const ruby: { ruby: string; version: string; engine: string; platform: string; bundle?: string } =
    JSON.parse(probe.stdout);
  logger.info(`Ruby ${ruby.version}: ${ruby.ruby}`);
  if (ruby.engine !== 'ruby' || !semver.satisfies(ruby.version, rubyRequirement)) {
    throw new Error(
      `Found ${ruby.engine} ${ruby.version} at ${ruby.ruby}. Required: MRI Ruby ${rubyRequirement}. Activate Ruby 3.3 (recommended), then rerun. Ruby is never installed automatically.`,
    );
  }
  if (!ruby.bundle) {
    throw new Error(
      `Ruby ${ruby.version} at ${ruby.ruby} needs Bundler ${bundlerVersion}. In that Ruby environment run: gem install bundler -v ${bundlerVersion} --no-document. Then rerun the original command. Other Bundler versions can remain installed.`,
    );
  }
  const version = await execa(ruby.ruby, ['-e', bundleLauncher, bundlerVersion, '--version'], {
    cwd: OptionHolder.projectDir,
    env,
    extendEnv: false,
    reject: false,
  });
  if (version.failed || version.stdout.trim() !== `Bundler version ${bundlerVersion}`) {
    throw new Error(
      `Bundler ${bundlerVersion} could not run with ${ruby.ruby}. Reinstall that Bundler in the selected Ruby environment.`,
    );
  }
  logger.info(`Bundler ${bundlerVersion}: ${ruby.bundle}`);

  const directory = resolve(OptionHolder.resourcesDir, '.ruby');
  const workspace = resolve(directory, OptionHolder.input.platform);
  const bundleEnv = {
    ...env,
    PATH: `${dirname(ruby.ruby)}:${dirname(process.execPath)}:${env.PATH ?? ''}`,
    BUNDLE_IGNORE_CONFIG: '1',
    BUNDLE_GEMFILE: resolve(directory, gemfileName),
    BUNDLE_PATH: resolve(directory, 'vendor', `${ruby.engine}-${ruby.version}-${ruby.platform}`),
    BUNDLE_APP_CONFIG: resolve(directory, '.bundle'),
    BUNDLE_USER_HOME: resolve(directory, '.bundle'),
    BUNDLE_FROZEN: 'true',
    BUNDLE_DISABLE_SHARED_GEMS: 'true',
    BUNDLE_WITHOUT: needsPods ? '' : 'ios',
    FASTLANE_SKIP_UPDATE_CHECK: '1',
    FASTLANE_HIDE_CHANGELOG: '1',
    FASTLANE_OPT_OUT_USAGE: '1',
  };

  async function bundle(
    args: string[],
    options: { cwd?: string; env?: Record<string, string>; capture?: boolean } = {},
  ) {
    const child = execa(ruby.ruby, ['-e', bundleLauncher, bundlerVersion, ...args], {
      cwd: options.cwd ?? workspace,
      env: { ...bundleEnv, ...options.env },
      extendEnv: false,
      all: true,
      reject: false,
    });
    if (!options.capture && child.all) await printRedactedOutput(child.all);
    const result = await child;
    if (result.failed) {
      if (options.capture) logger.error(redact(result.all ?? ''));
      throw new Error(
        `Ruby command failed (exit ${result.exitCode ?? 'unknown'}) using Ruby ${ruby.version}, Bundler ${bundlerVersion}, and ${bundleEnv.BUNDLE_GEMFILE}.`,
      );
    }
    return { stdout: result.stdout };
  }

  async function install() {
    copy(resolve(sourceDir, gemfileName), bundleEnv.BUNDLE_GEMFILE);
    copy(resolve(sourceDir, lockfileName), resolve(directory, lockfileName));
    write(resolve(directory, '.gitignore'), '*\n');
    await bundle(['install'], { cwd: directory });
  }

  return {
    bundle,
    install,
    directory,
    workspace,
    executable: ruby.ruby,
    version: ruby.version,
    bundlerVersion,
  };
}

export type RubyEnvironment = Awaited<ReturnType<typeof inspectRubyEnvironment>>;
