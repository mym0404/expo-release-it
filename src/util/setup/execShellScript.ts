import { execa, type Options } from 'execa';

export const exe = execa({
  stdin: 'pipe',
  stdout: 'inherit',
  stderr: 'inherit',
  shell: false,
});

export const yesShell = <OptionsType extends Options>(
  command: string,
  args: string[] = [],
  options: OptionsType,
) => {
  const subProcess = exe(command, args, { ...options, stdin: 'pipe' });
  subProcess.stdin?.write('y\n');
  subProcess.stdin?.end();
  return subProcess;
};
