import { iterateAllFiles } from './iterateAllFiles';
import { read, relativePath, write } from './FileUtil';
import { OptionHolder } from './OptionHolder';
import * as path from 'node:path';

export async function injectTemplatePlaceHolders(root: string) {
  await iterateAllFiles(root, async (filePath: string) => {
    const dirPath = path.dirname(filePath);
    let content = read(filePath);
    for (const [key, value] of Object.entries(OptionHolder.keyholderMap)) {
      content = content.replaceAll(`{{${key}}}`, value);
    }
    // dynamic replacements
    content = content.replaceAll(
      '{{key_dir_relative_path}}',
      relativePath(dirPath, OptionHolder.keyDir),
    );
    write(filePath, content);
  });
}
