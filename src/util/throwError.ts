import { log } from './Log';

export function throwError(message: string, e?: any): never {
  if (e) {
    log.error(message, e);
  } else {
    log.error(message);
  }
  process.exit(1);
}
