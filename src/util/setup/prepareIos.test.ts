import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { vi } from 'vitest';

import { exist, write } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { prepareIos, selectIosCandidate } from './prepareIos';

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock('execa', () => ({ execa: execute }));

it('requires an explicit choice when discovery is ambiguous or a configured name is missing', () => {
  expect(selectIosCandidate({ candidates: ['App'], option: '--ios-target' })).toBe('App');
  expect(() => selectIosCandidate({ candidates: ['A', 'B'], option: '--ios-scheme' })).toThrow(
    'Set --ios-scheme explicitly',
  );
  expect(() =>
    selectIosCandidate({ candidates: ['App'], selected: 'Missing', option: '--ios-target' }),
  ).toThrow('Candidates: App');
});

it('removes the temporary Node path produced by pod install before Xcode runs', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'release-ios-test-'));
  const localEnv = join(directory, 'ios', '.xcode.env.local');
  try {
    OptionHolder.projectDir = directory;
    OptionHolder.input.iosProject = undefined;
    OptionHolder.input.iosTarget = undefined;
    OptionHolder.input.iosScheme = undefined;
    execute.mockImplementation(() => {
      expect(exist(localEnv)).toBe(false);
      return Promise.resolve({
        stdout: JSON.stringify({ project: { schemes: ['ProductionScheme'] } }),
      });
    });
    const bundle = vi.fn().mockImplementation((args: string[]) => {
      if (args.includes('pod')) {
        write(localEnv, 'export NODE_BINARY=/var/folders/temporary-yarn/node\n');
        return Promise.resolve({ stdout: '' });
      }
      return Promise.resolve({ stdout: JSON.stringify(['MainApp']) });
    });
    await prepareIos({
      ruby: { bundle, executable: '/selected/ruby' },
      prebuild: async () => {
        write(join(directory, 'ios', 'DifferentProject.xcodeproj', 'project.pbxproj'), 'project');
      },
    });
    expect(exist(localEnv)).toBe(false);
    expect(OptionHolder.input.iosTarget).toBe('MainApp');
    expect(OptionHolder.input.iosScheme).toBe('ProductionScheme');
    expect(OptionHolder.input.iosProject).toBe(
      join(directory, 'ios', 'DifferentProject.xcodeproj'),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
