import chalk from 'chalk';
import { oraPromise } from 'ora';

export async function spinner<T>(text: string, promise: Promise<T>): Promise<T> {
  return oraPromise(promise, {
    text,
    successText: chalk.green(`${text} - Done`),
    failText: chalk.red(`${text} - Failed`),
  });
}
