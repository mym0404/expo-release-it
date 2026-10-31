import { createInterface } from 'node:readline';

import { execa, type Options } from 'execa';

import { redact } from '../logger';

export async function printRedactedOutput(stream: NodeJS.ReadableStream) {
  let hasPrivateKey = false;
  const privateKeyEnd = /-----END .*PRIVATE KEY-----/;
  for await (const line of createInterface({ input: stream })) {
    if (/-----BEGIN .*PRIVATE KEY-----/.test(line)) {
      hasPrivateKey = !privateKeyEnd.test(line);
      console.log('[REDACTED PRIVATE KEY]');
    } else if (privateKeyEnd.test(line)) {
      hasPrivateKey = false;
    } else if (!hasPrivateKey) {
      console.log(redact(line));
    }
  }
}

export async function exe(
  command: string,
  args: string[] = [],
  options: Pick<Options, 'cwd' | 'env' | 'extendEnv'> = {},
) {
  const child = execa(command, args, {
    ...options,
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe',
    all: true,
    reject: false,
  });
  if (child.all) await printRedactedOutput(child.all);
  const result = await child;
  if (result.failed) throw result;
  return result;
}
