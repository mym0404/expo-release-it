import { execa } from 'execa';

import { credentialProcessEnvironment } from '../CredentialVault';
import { exist, readdir, remove, resolve } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import type { RubyEnvironment } from './RubyEnvironment';

export async function prepareIos({
  ruby,
  prebuild,
}: {
  ruby: Pick<RubyEnvironment, 'bundle' | 'executable'>;
  prebuild: () => Promise<void>;
}) {
  await prebuild();
  const iosDir = resolve(OptionHolder.projectDir, 'ios');
  await ruby.bundle(['exec', 'pod', 'install'], { cwd: iosDir });
  // Yarn can leave a temporary Node executable path in this generated file.
  remove(resolve(iosDir, '.xcode.env.local'));

  const projectName = selectIosCandidate({
    candidates: readdir(iosDir).filter((name) => name.endsWith('.xcodeproj')),
    selected: OptionHolder.input.iosProject,
    option: '--ios-project',
  });
  const project = resolve(iosDir, projectName);
  const targets = await ruby.bundle(
    [
      'exec',
      ruby.executable,
      '-rjson',
      '-rxcodeproj',
      '-e',
      'p = Xcodeproj::Project.open(ARGV.first); puts JSON.generate(p.native_targets.select { |t| t.product_type == "com.apple.product-type.application" }.map(&:name))',
      project,
    ],
    { capture: true },
  );
  const targetNames: string[] = JSON.parse(targets.stdout);
  const listing = await execa('xcodebuild', ['-list', '-json', '-project', project], {
    env: credentialProcessEnvironment(),
    extendEnv: false,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const info: { project: { schemes: string[] } } = JSON.parse(listing.stdout);
  OptionHolder.input.iosProject = project;
  OptionHolder.input.iosTarget = selectIosCandidate({
    candidates: targetNames,
    selected: OptionHolder.input.iosTarget,
    option: '--ios-target',
  });
  OptionHolder.input.iosScheme = selectIosCandidate({
    candidates: info.project.schemes,
    selected: OptionHolder.input.iosScheme,
    option: '--ios-scheme',
  });
  const workspace = resolve(iosDir, projectName.replace(/\.xcodeproj$/, '.xcworkspace'));
  OptionHolder.input.iosWorkspace = exist(workspace) ? workspace : undefined;
}

export function selectIosCandidate({
  candidates,
  selected,
  option,
}: {
  candidates: string[];
  selected?: string;
  option: string;
}) {
  if (selected && candidates.includes(selected)) return selected;
  if (!selected && candidates.length === 1) return candidates[0]!;
  throw new Error(
    `Cannot select an iOS build candidate for ${option}${selected ? ` (${selected})` : ''}. Candidates: ${candidates.join(', ') || '(none)'}. Set ${option} explicitly.`,
  );
}
