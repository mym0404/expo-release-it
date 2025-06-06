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
