import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { vi } from 'vitest';

import { build } from '../../command/build';
import { pull } from '../../command/pull';
import { submit } from '../../command/submit';
import { upload } from '../../command/upload';
import { exist, write } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { inspectRubyEnvironment } from './RubyEnvironment';

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock('execa', () => ({ execa: execute }));
vi.mock('./setup', () => ({ setup: vi.fn() }));

let directory: string;
const bundler = /BUNDLED WITH\s+([\d.]+)/.exec(
  readFileSync('template/ruby/Gemfile.lock', 'utf8'),
)![1]!;
const supportedRuby = {
  ruby: '/selected/ruby',
  version: '3.3.12',
  engine: 'ruby',
  platform: 'arm64-darwin',
  bundle: '/selected/bundle',
};

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'release-ruby-test-'));
  OptionHolder.projectDir = directory;
  OptionHolder.resourcesDir = join(directory, 'expo-release-it');
  OptionHolder.keyDir = join(OptionHolder.resourcesDir, 'key');
  OptionHolder.tempDir = join(OptionHolder.resourcesDir, '.temp');
  OptionHolder.cli.templateDir = resolve('template');
  OptionHolder.input.platform = 'android';
  OptionHolder.input.sign = true;
  OptionHolder.keyholderMap = {
    ios_app_identifier: '',
    ios_developer_team_id: '',
    ios_match_git_url: '',
    ios_app_store_connect_api_key_id: '',
    ios_app_store_connect_api_key_issuer_id: '',
    ios_match_password: '',
    android_package_name: '',
    android_keystore_store_password: '',
    android_keystore_key_alias: '',
    android_keystore_key_password: '',
  };
  execute.mockReset();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

it.each(['3.2.9', '4.1.0'])(
  'rejects unsupported Ruby %s before creating any files',
  async (version) => {
    execute.mockResolvedValue({
      stdout: JSON.stringify({ ...supportedRuby, version }),
      failed: false,
    });
    await expect(inspectRubyEnvironment()).rejects.toThrow(`Found ruby ${version}`);
    expect(readdirSync(directory)).toEqual([]);
  },
);

it('reports the exact missing Bundler installation without installing or changing files', async () => {
  execute.mockResolvedValue({
    stdout: JSON.stringify({ ...supportedRuby, bundle: undefined }),
    failed: false,
  });
  await expect(inspectRubyEnvironment()).rejects.toThrow(
    `gem install bundler -v ${bundler} --no-document`,
  );
  expect(execute).toHaveBeenCalledTimes(1);
  expect(readdirSync(directory)).toEqual([]);
});

it('stops build before native changes when Ruby is incompatible', async () => {
  write(join(directory, 'ios', 'keep.txt'), 'existing native data');
  execute.mockResolvedValue({
    stdout: JSON.stringify({ ...supportedRuby, version: '3.2.9' }),
    failed: false,
  });
  await expect(build({ options: { platform: 'android', androidOutput: 'apk' } })).rejects.toThrow(
    'Required: MRI Ruby',
  );
  expect(readFileSync(join(directory, 'ios', 'keep.txt'), 'utf8')).toBe('existing native data');
  expect(exist(OptionHolder.resourcesDir)).toBe(false);
});

it('isolates installed gems and ignores inherited Bundler config and the PATH bundle', async () => {
  writeFileSync(join(directory, 'Gemfile'), 'user Gemfile');
  writeFileSync(join(directory, 'Gemfile.lock'), 'user lockfile');
  vi.stubEnv('BUNDLE_GEMFILE', join(directory, 'Gemfile'));
  vi.stubEnv('BUNDLE_PATH', '/user/gems');
  vi.stubEnv('BUNDLE_BIN_PATH', '/wrong/bundle');
  execute.mockResolvedValueOnce({ stdout: JSON.stringify(supportedRuby), failed: false });
  execute.mockResolvedValue({ stdout: `Bundler version ${bundler}`, failed: false });
  const ruby = await inspectRubyEnvironment();
  await ruby.install();
  expect(execute).toHaveBeenLastCalledWith(
    '/selected/ruby',
    ['-e', expect.stringContaining('Gem.bin_path'), bundler, 'install'],
    expect.objectContaining({
      extendEnv: false,
      env: expect.objectContaining({
        BUNDLE_GEMFILE: join(ruby.directory, 'Gemfile'),
        BUNDLE_IGNORE_CONFIG: '1',
        BUNDLE_FROZEN: 'true',
        BUNDLE_DISABLE_SHARED_GEMS: 'true',
      }),
    }),
  );
  const call = execute.mock.calls.at(-1)!;
  expect(call[2].env.BUNDLE_BIN_PATH).toBeUndefined();
  expect(readFileSync(join(directory, 'Gemfile'), 'utf8')).toBe('user Gemfile');
  expect(readFileSync(join(directory, 'Gemfile.lock'), 'utf8')).toBe('user lockfile');
});

it.each([upload, submit, pull])(
  'runs a store command from the managed workspace without touching native folders',
  async (command) => {
    const marker = join(directory, 'ios', 'keep.txt');
    write(marker, 'keep native project');
    const staleMetadata = join(
      OptionHolder.resourcesDir,
      '.ruby',
      'android',
      'fastlane',
      'stale.txt',
    );
    write(staleMetadata, 'old managed metadata');
    execute.mockImplementation((_file, args: string[]) =>
      Promise.resolve({
        stdout: args.includes('-rjson')
          ? JSON.stringify(supportedRuby)
          : `Bundler version ${bundler}`,
        failed: false,
      }),
    );
    await command({
      options: {
        platform: 'android',
        androidOutput: 'aab',
        uploadMetadata: false,
        uploadScreenshot: false,
      },
    });
    expect(readFileSync(marker, 'utf8')).toBe('keep native project');
    expect(exist(staleMetadata)).toBe(false);
    expect(execute.mock.calls.every(([file]) => file === 'ruby' || file === '/selected/ruby')).toBe(
      true,
    );
    expect(execute.mock.calls.at(-1)![2].cwd).toBe(
      join(OptionHolder.resourcesDir, '.ruby', 'android'),
    );
  },
);

it('provides the app identifier for both iOS metadata downloads without Appfile or native preparation', async () => {
  OptionHolder.keyholderMap.ios_app_identifier = 'net.example.app';
  write(join(OptionHolder.keyDir, 'ios_app_store_connect_api_key.p8'), 'test-private-key');
  const marker = join(directory, 'ios', 'keep.txt');
  write(marker, 'keep native project');
  execute.mockImplementation((_file, args: string[]) =>
    Promise.resolve({
      stdout: args.includes('-rjson')
        ? JSON.stringify(supportedRuby)
        : `Bundler version ${bundler}`,
      failed: false,
    }),
  );
  await pull({ options: { platform: 'ios', useLiveVersionIos: true } });
  const downloads = execute.mock.calls.filter(([, args]) => args.includes('deliver'));
  expect(downloads).toHaveLength(2);
  for (const [, args, options] of downloads) {
    expect(args).toEqual(expect.arrayContaining(['--app_identifier', 'net.example.app']));
    expect(args).not.toContain('test-private-key');
    expect(options.cwd).toBe(join(OptionHolder.resourcesDir, '.ruby', 'ios'));
  }
  expect(readFileSync(marker, 'utf8')).toBe('keep native project');
});
