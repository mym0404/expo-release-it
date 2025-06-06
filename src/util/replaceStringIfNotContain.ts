export function replaceStringIfNotContain(
  content: string,
  pattern: RegExp,
  modified: string,
): string {
  if (pattern.test(content) && !content.includes(modified)) {
    return content.replaceAll(pattern, modified);
  }
  return content;
}
