import chalk from 'chalk';

export const log = {
  success: (msg: any) => console.log(chalk.green(`✔ ${msg}`)),
  error: (msg: any) => console.log(chalk.red(`✖ ${msg}`)),
  warn: (msg: any) => console.log(chalk.yellow(`⚠ ${msg}`)),
  info: (msg: any) => console.log(chalk.cyan(`ℹ ${msg}`)),
  title: (msg: any) => console.log(chalk.bold.blue(`\n${msg}`)),
  dim: (msg: any) => console.log(chalk.dim(msg)),
};
