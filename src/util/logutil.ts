import chalk from 'chalk';

export const log = {
  success: (msg: string) => console.log(chalk.green(`✔ ${msg}`)),
  error: (msg: string) => console.log(chalk.red(`✖ ${msg}`)),
  warn: (msg: string) => console.log(chalk.yellow(`⚠ ${msg}`)),
  info: (msg: string) => console.log(chalk.cyan(`ℹ ${msg}`)),
  title: (msg: string) => console.log(chalk.bold.blue(`\n${msg}`)),
  dim: (msg: string) => console.log(chalk.dim(msg)),
};
