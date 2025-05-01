import { logger } from './logger';
import { isTest } from './EnvUtil';

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
