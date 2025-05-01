import { defineConfig } from 'tsup';
import glob from 'tiny-glob';
import * as path from 'node:path';

export default defineConfig(async () => {
  const entries = await glob('./src/**/!(*.test|*.spec).ts');
  const normalizedEntries = entries.map((p) => p.split(path.sep).join('/'));
  return [
    {
      entry: normalizedEntries,
      splitting: false,
      sourcemap: true,
      clean: true,
      format: 'esm',
      outDir: 'build',
      dts: true,
      silent: true,
    },
  ];
});
