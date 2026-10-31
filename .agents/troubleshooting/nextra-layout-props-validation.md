# Nextra Layout Props Validation

Decision date: 2026-11-01

## Failure and Cause

Documentation prerendering fails with `Invalid input: expected nonoptional, received undefined` at `children`. The published `nextra-theme-docs@4.6.1` layout removes `children` from its props before validating the remaining object, while its schema requires that property. The installed Zod rejects the missing key even though the caller supplied children.

## Current Decision

Keep the version-scoped pnpm patch registered in `pnpm-workspace.yaml`. `patches/nextra-theme-docs@4.6.1.patch` makes the layout validate all supplied props, then separate validated children from the theme configuration. It follows the correction merged in [upstream PR #4990](https://github.com/shuding/nextra/pull/4990).

A merged upstream fix is not proof that the installed release contains it. Editing only `node_modules` loses the correction on reinstall; weakening the children schema or downgrading Zod hides the invalid validation input instead of repairing it. The failure is not evidence that the documentation routes or bundler need replacing.

## Recurrence and Removal Criteria

Read this record before changing the dependency or patch, or investigating the same `children` validation error. On recurrence, verify that pnpm still applies the patch to the installed layout; package-version changes can invalidate the version-scoped registration.

Remove the patch only after inspecting a published package that validates the full props and excludes children from the resulting theme configuration. Require a clean installation from the updated lockfile and a successful production docs build without the patch. Remove the patch file and its registration together.
