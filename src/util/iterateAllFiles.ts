import { isDir, isFile, join, readdir } from './FileUtil';

export async function iterateAllFiles(root: string, callback: (filePath: string) => Promise<void>) {
  await go(root);

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
