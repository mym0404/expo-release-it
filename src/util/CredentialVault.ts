import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import {
  appendFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import * as util from 'node:util';

import { logger, registerSecrets } from './logger';
import { OptionHolder } from './OptionHolder';

export const encryptionKeyEnvironment = 'EXPO_RELEASE_IT_ENCRYPTION_KEY';
export const credentialVaultFilename = 'credentials.enc.json';
export const appStoreApiFilename = 'app_store_connect_api.json';
export const credentialFilenames = {
  androidKeystore: 'android_release.keystore',
  androidServiceAccount: 'android_play_console_service_account.json',
  iosApiKey: 'ios_app_store_connect_api_key.p8',
};
const fileMode = 0o600;
const directoryMode = 0o700;
const algorithm = 'aes-256-gcm';
const formatVersion = 1;
const authenticationTagLength = 16;
const saltLength = 16;
const ivLength = 12;
const keyLength = 32;
const minimumKeyLength = 16;
const scryptOptions = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const associatedData = Buffer.from('expo-release-it:credentials:v1');
const decryptionError = `Cannot decrypt credentials. Check ${encryptionKeyEnvironment}; the encrypted file may also be damaged.`;

type CredentialData = {
  keyholder: Record<string, string>;
  files: Record<string, string>;
};
let activeFiles: Record<string, string> | undefined;
let temporaryDirectory: string | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

function decodeBase64(value: unknown, length?: number) {
  if (typeof value !== 'string') throw new Error(decryptionError);
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value || (length !== undefined && bytes.length !== length))
    throw new Error(decryptionError);
  return bytes;
}

function validateData(value: unknown): CredentialData {
  if (!isRecord(value) || !isStringRecord(value.keyholder) || !isStringRecord(value.files))
    throw new Error('Invalid credential data.');
  for (const [name, contents] of Object.entries(value.files)) {
    if (
      !name ||
      isAbsolute(name) ||
      name.split(/[\\/]/).some((part) => !part || part === '..' || part === '.')
    )
      throw new Error('Invalid credential filename.');
    decodeBase64(contents);
  }
  return { keyholder: value.keyholder, files: value.files };
}

export function warnPlaintextCredentials() {
  const found =
    existsSync(OptionHolder.keyholderFilePath) ||
    (existsSync(OptionHolder.keyDir) && readdirSync(OptionHolder.keyDir).length > 0) ||
    existsSync(join(OptionHolder.tempDir, appStoreApiFilename));
  if (found)
    logger.warn(
      'Legacy plaintext credentials found in keyholder.json, key/, or .temp/app_store_connect_api.json. They will be encrypted when release credentials are loaded; init can also migrate them.',
    );
  return found;
}

export function getEncryptionKey() {
  let key = process.env[encryptionKeyEnvironment];
  const envFile = resolve(OptionHolder.projectDir, OptionHolder.input.envFile ?? '.env');
  if (key === undefined && (OptionHolder.input.envFile || existsSync(envFile))) {
    if (typeof util.parseEnv !== 'function')
      throw new Error(
        `Reading .env files requires Node.js 20.12 or newer. Alternatively set ${encryptionKeyEnvironment} in the process environment.`,
      );
    try {
      const values = util.parseEnv(readFileSync(envFile, 'utf8'));
      if (
        encryptionKeyEnvironment in values &&
        typeof values[encryptionKeyEnvironment] === 'string'
      )
        key = values[encryptionKeyEnvironment];
    } catch {
      throw new Error(
        'Cannot read the encryption-key env file. Check --env-file and file permissions.',
      );
    }
  }
  if (key !== undefined) registerSecrets([key]);
  if (key === undefined || key.length < minimumKeyLength)
    throw new Error(
      `${encryptionKeyEnvironment} is required for every command. Set a key of at least ${minimumKeyLength} characters in the process environment or an env file before running this command. Use --env-file to select another file.`,
    );
  return key;
}

export function readCredentialVault(
  key: string,
  file = join(OptionHolder.resourcesDir, credentialVaultFilename),
) {
  let derived: Buffer | undefined;
  try {
    if (!lstatSync(file).isFile()) throw new Error(decryptionError);
    const envelope: unknown = JSON.parse(readFileSync(file, 'utf8'));
    if (
      !isRecord(envelope) ||
      envelope.version !== formatVersion ||
      envelope.algorithm !== algorithm
    )
      throw new Error(decryptionError);
    const salt = decodeBase64(envelope.salt, saltLength);
    const iv = decodeBase64(envelope.iv, ivLength);
    const tag = decodeBase64(envelope.tag, authenticationTagLength);
    const ciphertext = decodeBase64(envelope.ciphertext);
    derived = scryptSync(key, salt, keyLength, scryptOptions);
    const decipher = createDecipheriv(algorithm, derived, iv, {
      authTagLength: authenticationTagLength,
    });
    decipher.setAAD(associatedData);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    try {
      return validateData(JSON.parse(plaintext.toString('utf8')));
    } finally {
      plaintext.fill(0);
    }
  } catch {
    throw new Error(decryptionError);
  } finally {
    derived?.fill(0);
  }
}

export function readLegacyCredentials() {
  const data: CredentialData = { keyholder: {}, files: {} };
  const originals: string[] = [];
  if (existsSync(OptionHolder.keyholderFilePath)) {
    const contents = readPlaintext(OptionHolder.keyholderFilePath);
    try {
      const keyholder: unknown = JSON.parse(contents.toString('utf8'));
      if (!isStringRecord(keyholder)) throw new Error();
      data.keyholder = keyholder;
    } catch {
      throw new Error('Cannot read legacy keyholder.json. Expected an object with string values.');
    }
    originals.push(OptionHolder.keyholderFilePath);
    registerSecrets(Object.values(data.keyholder));
  }
  if (existsSync(OptionHolder.keyDir)) visit(OptionHolder.keyDir);
  const legacyApiFile = join(OptionHolder.tempDir, appStoreApiFilename);
  if (existsSync(legacyApiFile)) {
    const name = `legacy/${appStoreApiFilename}`;
    const contents = readPlaintext(legacyApiFile);
    data.files[name] = contents.toString('base64');
    originals.push(legacyApiFile);
  }
  return { data, originals };

  function visit(directory: string) {
    if (!lstatSync(directory).isDirectory())
      throw new Error('Credential directories must not be symbolic links.');
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else {
        const contents = readPlaintext(path);
        data.files[relative(OptionHolder.keyDir, path).split(sep).join('/')] =
          contents.toString('base64');
        originals.push(path);
      }
    }
  }
}

function readPlaintext(file: string) {
  if (!lstatSync(file).isFile())
    throw new Error('Credential inputs must be regular files, not symbolic links.');
  return readFileSync(file);
}

export function writeCredentialVault(data: CredentialData, key: string, originals: string[] = []) {
  const salt = randomBytes(saltLength);
  const iv = randomBytes(ivLength);
  const derived = scryptSync(key, salt, keyLength, scryptOptions);
  const plaintext = Buffer.from(JSON.stringify(data));
  let encoded: string;
  try {
    const cipher = createCipheriv(algorithm, derived, iv, {
      authTagLength: authenticationTagLength,
    });
    cipher.setAAD(associatedData);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    encoded = JSON.stringify({
      version: formatVersion,
      algorithm,
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      ciphertext: ciphertext.toString('base64'),
    });
  } finally {
    derived.fill(0);
    plaintext.fill(0);
  }
  mkdirSync(OptionHolder.resourcesDir, { recursive: true, mode: directoryMode });
  const pending = join(
    OptionHolder.resourcesDir,
    `.credentials-${randomBytes(8).toString('hex')}.tmp`,
  );
  try {
    writeFileSync(pending, encoded, { flag: 'wx', mode: fileMode });
    if (JSON.stringify(readCredentialVault(key, pending)) !== JSON.stringify(data))
      throw new Error('Encrypted credential verification failed. Plaintext files were retained.');
    renameSync(pending, join(OptionHolder.resourcesDir, credentialVaultFilename));
    protectSecretPaths();
    for (const original of originals) rmSync(original);
    if (existsSync(OptionHolder.keyDir)) removeEmptyDirectories(OptionHolder.keyDir);
  } finally {
    rmSync(pending, { force: true });
  }
}

function removeEmptyDirectories(directory: string) {
  for (const entry of readdirSync(directory, { withFileTypes: true }))
    if (entry.isDirectory()) removeEmptyDirectories(join(directory, entry.name));
  if (readdirSync(directory).length === 0) rmdirSync(directory);
}

function protectSecretPaths() {
  appendIgnores(join(OptionHolder.resourcesDir, '.gitignore'), [
    '/keyholder.json',
    '/key/',
    '/.ruby/',
    '/.temp/',
  ]);
  const envFile = relative(
    OptionHolder.projectDir,
    resolve(OptionHolder.projectDir, OptionHolder.input.envFile ?? '.env'),
  );
  if (envFile && !envFile.startsWith(`..${sep}`) && !isAbsolute(envFile))
    appendIgnores(join(OptionHolder.projectDir, '.gitignore'), [
      `/${envFile.split(sep).join('/')}`,
    ]);

  function appendIgnores(file: string, entries: string[]) {
    if (existsSync(file) && !lstatSync(file).isFile())
      throw new Error('Cannot protect secret paths: .gitignore must be a regular file.');
    const previous = existsSync(file) ? readFileSync(file, 'utf8') : '';
    const missing = entries.filter((entry) => !previous.split(/\r?\n/).includes(entry));
    if (missing.length)
      appendFileSync(
        file,
        `${previous && !previous.endsWith('\n') ? '\n' : ''}${missing.join('\n')}\n`,
        { mode: fileMode },
      );
  }
}

export function loadRuntimeCredentials(key: string) {
  const hasPlaintext = warnPlaintextCredentials();
  const hasVault = existsSync(join(OptionHolder.resourcesDir, credentialVaultFilename));
  if (!hasVault && !hasPlaintext)
    throw new Error('Encrypted credentials are missing. Run expo-release-it init.');
  let data: CredentialData = hasVault ? readCredentialVault(key) : { keyholder: {}, files: {} };
  if (hasPlaintext) {
    const legacy = readLegacyCredentials();
    data = {
      keyholder: { ...data.keyholder, ...legacy.data.keyholder },
      files: { ...data.files, ...legacy.data.files },
    };
    writeCredentialVault(data, key, legacy.originals);
    logger.info('Plaintext credentials migrated to encrypted storage.');
  }
  Object.assign(OptionHolder.keyholderMap, data.keyholder);
  activeFiles = data.files;
  registerSecrets(Object.values(data.keyholder));
}

export function credentialProcessEnvironment(environment: NodeJS.ProcessEnv = process.env) {
  return { ...environment, [encryptionKeyEnvironment]: '' };
}

export function credentialKeyPath(name: string) {
  return writeCredentialTemporaryFile(name, readCredentialFile(name));
}

export function readCredentialFile(name: string) {
  const contents = activeFiles?.[name];
  if (contents === undefined)
    throw new Error(`Credential file ${name} is missing. Import it with init.`);
  const decoded = Buffer.from(contents, 'base64');
  registerSecrets([decoded.toString('utf8')]);
  return decoded;
}

export function writeCredentialTemporaryFile(name: string, contents: Buffer) {
  if (!temporaryDirectory) {
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'expo-release-it-credentials-'));
    process.once('exit', cleanupCredentials);
    process.once('SIGINT', interruptCredentials);
    process.once('SIGTERM', terminateCredentials);
  }
  const file = join(temporaryDirectory, name);
  mkdirSync(dirname(file), { recursive: true, mode: directoryMode });
  writeFileSync(file, contents, { mode: fileMode });
  registerSecrets([contents.toString('utf8')]);
  contents.fill(0);
  return file;
}

export function cleanupCredentials() {
  if (temporaryDirectory) rmSync(temporaryDirectory, { recursive: true, force: true });
  temporaryDirectory = undefined;
  activeFiles = undefined;
  process.off('exit', cleanupCredentials);
  process.off('SIGINT', interruptCredentials);
  process.off('SIGTERM', terminateCredentials);
}

function interruptCredentials() {
  cleanupCredentials();
  process.exit(130);
}

function terminateCredentials() {
  cleanupCredentials();
  process.exit(143);
}
