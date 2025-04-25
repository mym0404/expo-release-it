import { defineConfig } from 'tsup';
import glob from 'tiny-glob';

export default defineConfig(async () => {
  return [
    {
      entry: await glob('./src/**/!(*.d|*.spec).ts'),
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
