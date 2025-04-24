import chalk from 'chalk';

export const logger = {
  success: (...msg: any[]) => console.log(chalk.green(`✔ ${msg.join(', ')}`)),
  error: (...msg: any[]) => console.log(chalk.red(`✖ ${msg.join(', ')}`)),
  warn: (...msg: any[]) => console.log(chalk.yellow(`⚠ ${msg.join(', ')}`)),
  info: (...msg: any[]) => console.log(chalk.cyan(`ℹ ${msg.join(', ')}`)),
  title: (...msg: any[]) => console.log(chalk.bold.blue(`\n${msg.join(', ')}`)),
  dim: (...msg: any[]) => console.log(chalk.dim(msg.join(', '))),
};
