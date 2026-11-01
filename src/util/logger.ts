import chalk from 'chalk';

import { OptionHolder } from './OptionHolder';

const registeredSecrets = new Set<string>();

export function registerSecrets(values: Iterable<string>) {
  for (const value of values)
    if (value) {
      registeredSecrets.add(value);
      registeredSecrets.add(JSON.stringify(value).slice(1, -1));
    }
}

export function redact(message: string) {
  const secrets = [
    ...registeredSecrets,
    ...Object.values(OptionHolder.keyholderMap),
    ...Object.entries(process.env)
      .filter(([key]) => /password|token|secret|credential|encryption.?key/i.test(key))
      .map(([, value]) => value),
  ]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .flatMap((value) => [value, ...value.split(/\r?\n/).filter(Boolean)]);
  return secrets
    .sort((a, b) => b.length - a.length)
    .reduce((text, secret) => text.replaceAll(secret, '[REDACTED]'), message)
    .replace(/(https?:\/\/)[^/\s@]+@/g, '$1[REDACTED]@')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED]')
    .replace(
      /-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g,
      '[REDACTED PRIVATE KEY]',
    )
    .replace(/("(?:private_key|password|token)"\s*:\s*")[^"]*/gi, '$1[REDACTED]');
}

export const logger = {
  success: (...msg: any[]) => console.log(chalk.green(`✔ ${redact(msg.join(', '))}`)),
  done: (...msg: any[]) => console.log(chalk.green(`✔ ${redact(msg.join(', '))} - Done`)),
  error: (...msg: any[]) => console.log(chalk.red(`✖ ${redact(msg.join(', '))}`)),
  warn: (...msg: any[]) => console.log(chalk.yellow(`⚠ ${redact(msg.join(', '))}`)),
  info: (...msg: any[]) => console.log(chalk.cyan(`ℹ ${redact(msg.join(', '))}`)),
  title: (...msg: any[]) => console.log(chalk.bold.blue(`\n${redact(msg.join(', '))}`)),
  dim: (...msg: any[]) => console.log(chalk.dim(redact(msg.join(', ')))),
};
