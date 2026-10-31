# Conditional Verification

## Default Check Limits

The root TypeScript check includes `src` and `package.json`; it does not type-check the documentation or example workspaces. Vitest uses its default test discovery: the current suite covers version-code conversion and conditional text replacement. The example's `*-test.tsx` snapshot naming is outside that discovery, and its package has no test script. There is no configured CLI or native end-to-end suite.

Oxlint checks supported JS/TS files, not MDX rendering. The generated configuration declaration is excluded from lint but remains covered by formatting and the root type check. Generated build, Expo, native, and search output are excluded from lint/format checks; pnpm manages the lockfile without Oxfmt formatting.

CI validates changesets and runs the root check and CLI build; it does not build docs or launch the example app. Pull requests are validated against `origin/main`, so release-affecting changes need a changeset and non-release changes can use an empty changeset.

## Conditional Checks

| Change                                                          | Command                                                    | What it verifies                                                                                                               |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Docs application, MDX, framework configuration, or dependencies | `pnpm --filter docs build`                                 | Next.js production compilation and prerendering through Webpack, followed by Pagefind search-index generation via `postbuild`. |
| Example TypeScript or TSX                                       | `pnpm --filter example exec tsc --noEmit -p tsconfig.json` | The example's own TypeScript inputs; this does not launch Expo or execute its snapshot test.                                   |
| Configuration schema, when regenerating only its declaration    | `pnpm build:json-schema-type`                              | Regenerates and formats the declaration. Review its diff and follow with the root checks.                                      |

Native preparation, signing, binary compilation, and store operations are outside these checks. Changes to those workflows also require the relevant platform toolchain and integration verification; passing the helper tests does not establish a successful native build or store release.

The authoritative coverage definitions are `package.json`, `lefthook.yml`, the workspace TypeScript configurations, `vite.config.ts`, the Oxc configurations, and `.github/workflows/ci.yml`.
