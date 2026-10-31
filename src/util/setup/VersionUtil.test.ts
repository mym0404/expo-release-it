import {
  checkVersionCodeIsTiedWithVersionName,
  generateVersionCodeTiedWithVersionName,
} from './VersionUtil';

describe('checkVersionCodeIsTiedWithVersionName', () => {
  it('return true if version name is matched with version code', () => {
    expect(checkVersionCodeIsTiedWithVersionName('1.2.3', '1002003')).toBe(true);
    expect(checkVersionCodeIsTiedWithVersionName('v1.2.3', '1002003')).toBe(true);
  });
  it('return false if version name is not matched with version code', () => {
    expect(checkVersionCodeIsTiedWithVersionName('1.2.3', '1002004')).toBe(false);
  });
});

describe('generateVersionCodeTiedWithVersionName', () => {
  it('return matched version code from valid version name', () => {
    expect(generateVersionCodeTiedWithVersionName('12.2.3')).toEqual('12002003');
    expect(generateVersionCodeTiedWithVersionName('v1.2.3')).toEqual('1002003');
  });
  it('throw error if invalid version name is passed', () => {
    expect(() => generateVersionCodeTiedWithVersionName('invalid')).toThrow();
  });
});

describe('configuration read and bump', () => {
  it.each(['app.json', 'app.config.js'])('preserves the %s version contract', async (filename) => {
    const { mkdtempSync, rmSync, readFileSync } = await import('node:fs');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');
    const { write } = await import('../FileUtil');
    const { OptionHolder } = await import('../OptionHolder');
    const { parseBinaryVersions, injectBinaryVersions } = await import('./VersionUtil');
    const directory = mkdtempSync(join(tmpdir(), 'release-version-test-'));
    try {
      OptionHolder.projectDir = directory;
      const path = join(directory, filename);
      write(
        path,
        filename === 'app.json'
          ? JSON.stringify({
              expo: { version: '1.2.3', ios: { buildNumber: '42' }, android: { versionCode: 42 } },
            })
          : "const VERSION_NAME = '1.2.3';\nconst VERSION_CODE = 42;\nmodule.exports = {};\n",
      );
      await parseBinaryVersions();
      expect(OptionHolder.versionName).toBe('1.2.3');
      expect(OptionHolder.versionCode).toBe('42');
      await injectBinaryVersions({ versionName: '1.2.4', versionCode: '43' });
      await parseBinaryVersions();
      expect(OptionHolder.versionName).toBe('1.2.4');
      expect(OptionHolder.versionCode).toBe('43');
      if (filename === 'app.json') {
        const config = JSON.parse(readFileSync(path, 'utf8'));
        expect(config.expo.ios.buildNumber).toBe('43');
        expect(config.expo.android.versionCode).toBe(43);
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
