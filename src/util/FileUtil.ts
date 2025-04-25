import fs from 'fs-extra';
import * as path from 'path';

export const join = path.join;
export const resolve = path.resolve;

export function exist(path: string) {
  return fs.existsSync(path);
}

export function isDir(path: string) {
  return exist(path) && fs.lstatSync(path).isDirectory();
}

export function relativePath(from: string, to: string) {
  return path.relative(from, to);
}

export function isFile(path: string) {
  return exist(path) && fs.lstatSync(path).isFile();
}

export function read(path: string) {
  return fs.readFileSync(path, { encoding: 'utf8' });
}

export function readdir(path: string) {
  return fs.readdirSync(path);
}

// you should require when possible(optimized in js)
export function readJsonSlow(path: string) {
  return fs.readJSONSync(path);
}

export function write(p: string, content: string) {
  const dir = path.dirname(p);
  if (!exist(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return fs.writeFileSync(p, content);
}
export function copy(src: string, dest: string) {
  fs.copySync(src, dest);
}

export function writeJson(path: string, json: any) {
  return write(path, JSON.stringify(json, null, 2));
}

export function remove(path: string) {
  if (!exist(path)) {
    return;
  }

  if (fs.lstatSync(path).isDirectory()) {
    return fs.rmSync(path, { force: true, recursive: true });
  } else {
    return fs.rmSync(path, { force: true });
  }
}

export async function iterateDir(path: string, fn: (file: string) => Promise<void> | void) {
  if (!isDir(path)) {
    return;
  }

  for (const file of fs.readdirSync(path)) {
    await fn(file);
  }
}
