export function replaceStringIfNotContain(
  content: string,
  pattern: RegExp,
  modified: string,
  isGlobal: boolean,
): string {
  if (pattern.test(content) && !content.includes(modified)) {
    if (isGlobal) {
      return content.replaceAll(pattern, modified);
    } else {
      return content.replace(pattern, modified);
    }
  }
  return content;
}
