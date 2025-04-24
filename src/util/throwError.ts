import { logger } from './logger';

export function throwError(message: string, e?: any): never {
  if (e) {
    logger.error(message, e);
  } else {
    logger.error(message);
  }
  process.exit(1);
}
