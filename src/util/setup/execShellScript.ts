import { execa, type Options } from 'execa';

export const exe = execa({ stdin: 'pipe', stdout: 'inherit', stderr: 'inherit', shell: false });

export const yesShell = async (script: string, options?: Options) => {
  const subProcess = exe(script, options);
  subProcess.stdin?.write('y\n');
  subProcess.stdin?.end();
  return subProcess;
};
