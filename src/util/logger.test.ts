import { vi } from 'vitest';

import { redact } from './logger';
import { OptionHolder } from './OptionHolder';

it('redacts credentials from messages, URL userinfo, tokens, and private keys', () => {
  const previous = OptionHolder.keyholderMap.ios_match_password;
  OptionHolder.keyholderMap.ios_match_password = 'test-secret-password';
  vi.stubEnv('TEST_ACCESS_TOKEN', 'test-access-token');
  try {
    const message =
      'test-secret-password test-access-token https://user:password@example.com eyJheader.payload.signature\n-----BEGIN PRIVATE KEY-----\nprivate-data\n-----END PRIVATE KEY-----\n{"private_key":"escaped-key"}';
    const output = redact(message);
    expect(output).not.toContain('test-secret-password');
    expect(output).not.toContain('test-access-token');
    expect(output).not.toContain('user:password');
    expect(output).not.toContain('eyJheader');
    expect(output).not.toContain('private-data');
    expect(output).not.toContain('escaped-key');
  } finally {
    OptionHolder.keyholderMap.ios_match_password = previous;
    vi.unstubAllEnvs();
  }
});

it('redacts a private key even when a child process emits it in separate chunks', async () => {
  const { Readable } = await import('node:stream');
  const { printRedactedOutput } = await import('./setup/execShellScript');
  const output = vi.spyOn(console, 'log').mockImplementation(() => {});
  try {
    await printRedactedOutput(
      Readable.from([
        'before\n-----BEGIN PRIVATE KEY-----\n',
        'sensitive-data\n-----END PRIVATE KEY-----\nafter\n',
      ]),
    );
    expect(output.mock.calls.flat().join('\n')).toBe('before\n[REDACTED PRIVATE KEY]\nafter');
  } finally {
    output.mockRestore();
  }
});
