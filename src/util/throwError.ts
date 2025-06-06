import { isTest } from './EnvUtil';
import { logger } from './logger';

export function throwError(message: string, e?: any): never {
  if (e) {
    logger.error(message, e);
  } else {
    logger.error(message);
  }
  if (isTest) {
    throw new Error('throwError');
  }
  process.exit(1);
}
