import { read, write } from './FileUtil';
import { iterateAllFiles } from './iterateAllFiles';
import { OptionHolder } from './OptionHolder';

export async function injectTemplatePlaceHolders(root: string) {
  await iterateAllFiles(root, async (filePath: string) => {
    let content = read(filePath);
    for (const [key, value] of Object.entries(OptionHolder.keyholderMap)) {
      content = content.replaceAll(`{{${key}}}`, value);
    }
    write(filePath, content);
  });
}
