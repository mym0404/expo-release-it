import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { access, cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';

const [sdk, platform, format] = process.argv.slice(2);
assert.ok(['57', '58'].includes(sdk), 'Expected SDK 57 or 58');
assert.ok(['android', 'ios'].includes(platform), 'Expected android or ios');
if (platform === 'android') assert.ok(['apk', 'aab'].includes(format));
const repository = resolve(import.meta.dirname, '..');
const directory = await mkdtemp(join(tmpdir(), 'expo-release-it-e2e-'));
const project = join(directory, 'app');
const resources = join(project, 'expo-release-it');
const artifacts = join(
  repository,
  '.e2e-artifacts',
  `sdk-${sdk}-${platform}-${format ?? 'unsigned'}`,
);
const testPassword = 'expo-release-it-e2e-password';
const env = { ...process.env, CI: '1', EXPO_RELEASE_IT_TEST_PASSWORD: testPassword };
if (platform === 'android' && !env.ANDROID_HOME && process.platform === 'darwin') {
  env.ANDROID_HOME = join(homedir(), 'Library', 'Android', 'sdk');
}
function run(command, args, { cwd = project, capture = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  });
  if (result.status !== 0) {
    if (capture) console.error(result.stderr);
    throw new Error(`${command} failed with exit ${result.status}`);
  }
  return result.stdout ?? '';
}
try {
  const example = join(repository, 'examples', `sdk-${sdk}`);
  await cp(example, project, {
    recursive: true,
    filter: (path) =>
      !['node_modules', 'ios', 'android', 'expo-release-it', '.expo'].some((name) =>
        relative(example, path).split(sep).includes(name),
      ),
  });
  run('pnpm', ['pack', '--pack-destination', directory], { cwd: repository });
  const tarball = (await readdir(directory)).find((name) => name.endsWith('.tgz'));
  assert.ok(tarball, 'Package tarball must exist');
  run('npm', [
    'install',
    '--no-audit',
    '--no-fund',
    '--legacy-peer-deps',
    join(directory, tarball),
  ]);
  const gemfile = 'source "https://invalid.example"\ngem "do_not_resolve_user_gems"\n';
  const lockfile = '# user lockfile\n';
  await writeFile(join(project, 'Gemfile'), gemfile);
  await writeFile(join(project, 'Gemfile.lock'), lockfile);
  await mkdir(join(resources, 'key'), { recursive: true });
  const keystore = join(resources, 'key', 'android_release.keystore');
  const cli = join(project, 'node_modules', 'expo-release-it', 'bin', 'expo-release-it.mjs');
  let expected;
  if (platform === 'android') {
    run('keytool', [
      '-genkeypair',
      '-keystore',
      keystore,
      '-alias',
      'release-test',
      '-keyalg',
      'RSA',
      '-keysize',
      '2048',
      '-validity',
      '2',
      '-dname',
      'CN=Release Integration Test',
      '-storepass:env',
      'EXPO_RELEASE_IT_TEST_PASSWORD',
      '-keypass:env',
      'EXPO_RELEASE_IT_TEST_PASSWORD',
      '-noprompt',
    ]);
    await writeFile(
      join(resources, 'keyholder.json'),
      JSON.stringify({
        android_keystore_store_password: testPassword,
        android_keystore_key_password: testPassword,
        android_keystore_key_alias: 'release-test',
      }),
    );
    expected = run(
      'keytool',
      ['-list', '-v', '-keystore', keystore, '-storepass:env', 'EXPO_RELEASE_IT_TEST_PASSWORD'],
      { capture: true },
    )
      .match(/SHA256:\s*([A-Fa-f0-9:]+)/)?.[1]
      ?.replaceAll(':', '')
      .toLowerCase();
    assert.ok(expected, 'Test signing certificate must be readable');
    env.EXPO_RELEASE_IT_ENCRYPTION_KEY = randomBytes(32).toString('base64');
  }
  const removedMarker = join(project, platform, 'prebuild-must-remove.txt');
  const preservedMarker = join(project, platform === 'ios' ? 'android' : 'ios', 'must-remain.txt');
  await mkdir(join(removedMarker, '..'), { recursive: true });
  await mkdir(join(preservedMarker, '..'), { recursive: true });
  await writeFile(removedMarker, 'old generated project');
  await writeFile(preservedMarker, 'other platform');
  run(process.execPath, [
    cli,
    'build',
    '--platform',
    platform,
    ...(platform === 'ios' ? ['--no-sign'] : ['--androidOutput', format]),
  ]);
  await assert.rejects(access(removedMarker));
  assert.equal(await readFile(preservedMarker, 'utf8'), 'other platform');
  assert.equal(await readFile(join(project, 'Gemfile'), 'utf8'), gemfile);
  assert.equal(await readFile(join(project, 'Gemfile.lock'), 'utf8'), lockfile);
  const toolLock = join(resources, '.ruby', 'Gemfile.lock');
  assert.equal(
    await readFile(toolLock, 'utf8'),
    await readFile(join(repository, 'template', 'ruby', 'Gemfile.lock'), 'utf8'),
  );
  if (platform === 'android') {
    await assert.rejects(access(keystore));
    await assert.rejects(access(join(resources, 'keyholder.json')));
    assert.ok(
      !(await readFile(join(resources, 'credentials.enc.json'), 'utf8')).includes(testPassword),
    );
    const artifact = join(resources, 'output', 'android', format, `app-release.${format}`);
    let certificate;
    if (format === 'aab') {
      run('jarsigner', ['-verify', artifact]);
      certificate = run('keytool', ['-printcert', '-jarfile', artifact], { capture: true })
        .match(/SHA256:\s*([A-Fa-f0-9:]+)/)?.[1]
        ?.replaceAll(':', '')
        .toLowerCase();
    } else {
      const sdkRoot =
        env.ANDROID_HOME ?? env.ANDROID_SDK_ROOT ?? join(homedir(), 'Library', 'Android', 'sdk');
      const tools = (await readdir(join(sdkRoot, 'build-tools')))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .at(-1);
      const output = run(
        join(sdkRoot, 'build-tools', tools, 'apksigner'),
        ['verify', '--print-certs', artifact],
        { capture: true },
      );
      certificate = output
        .match(/certificate SHA-256 digest:\s*([a-fA-F0-9]+)/)?.[1]
        ?.toLowerCase();
    }
    assert.equal(certificate, expected, 'Release binary must use the test release certificate');
    const gradle = await readFile(join(project, 'android', 'app', 'build.gradle'), 'utf8');
    assert.match(gradle, /debug\s*\{/);
    assert.ok(
      !gradle.includes(testPassword),
      'Signing passwords must not be written into Gradle source',
    );
  } else {
    const archive = join(resources, 'output', 'ios', 'app.xcarchive');
    const apps = await readdir(join(archive, 'Products', 'Applications'));
    assert.equal(apps.filter((name) => name.endsWith('.app')).length, 1);
    const app = join(archive, 'Products', 'Applications', apps[0]);
    const executable = run(
      '/usr/libexec/PlistBuddy',
      ['-c', 'Print :CFBundleExecutable', join(app, 'Info.plist')],
      { capture: true },
    ).trim();
    assert.ok((await readFile(join(app, executable))).length > 0);
    assert.ok(
      !(await readdir(app)).includes('_CodeSignature'),
      'Unsigned build must not have an app signature',
    );
    assert.ok(!(await readdir(join(project, 'ios'))).includes('.xcode.env.local'));
  }
  await mkdir(artifacts, { recursive: true });
  await cp(join(resources, 'output'), artifacts, { recursive: true });
  console.log(`SDK ${sdk} ${platform} ${format ?? 'unsigned'} E2E passed: ${artifacts}`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
