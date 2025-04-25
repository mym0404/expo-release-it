import { OptionHolder } from './OptionHolder';
import { readdir, isFile, isDir, join } from './FileUtil';

export async function iterateAllFilesInGeneratedTemplate(
  callback: (filePath: string) => Promise<void>,
) {
  for (const dir of OptionHolder.templateDirNames) {
    await go(join(OptionHolder.outputOfInitDir, dir));
  }

  async function go(dirPath: string) {
    const paths = readdir(dirPath).map((f) => join(dirPath, f));

    for (const p of paths) {
      if (isFile(p)) {
        await callback(p);
      } else if (isDir(p)) {
        await go(p);
      }
    }
  }
}
