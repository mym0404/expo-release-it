import path from 'node:path';
import { OptionHolder } from './OptionHolder';
import fs from 'fs-extra';

export async function iterateAllFilesInGeneratedTemplate(
  callback: (filePath: string) => Promise<void>,
) {
  for (const dir of OptionHolder.templateDirNames) {
    await go(path.join(OptionHolder.rootDir, dir));
  }

  async function go(dirPath: string) {
    const paths = (await fs.readdir(dirPath)).map((f) => path.join(dirPath, f));

    for (const p of paths) {
      const stat = await fs.stat(p);
      if (stat.isFile()) {
        await callback(p);
      } else if (stat.isDirectory()) {
        await go(p);
      }
    }
  }
}
