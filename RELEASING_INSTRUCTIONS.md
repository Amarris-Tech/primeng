# Releasing `@amarris-tech/primeng`

This repository contains the Amarris fork of PrimeNG v18.

Packages are published to **GitHub Packages** under the scope:

```text
@amarris-tech/primeng
```

## Prerequisites

* Write access to this repository.
* A GitHub Personal Access Token (PAT) with `write:packages` permission.
* The PAT stored as the `PAT_PUBLISH` repository secret.
* GitHub Actions enabled.

## Release process

This is a pnpm workspace monorepo. The publishable library lives at
`packages/primeng`, but its version, `repository` and `bugs` fields are
overwritten from the **root** `package.json` every time the library is built
(see `pnpm run build:lib` -> `packages/primeng/scripts/prebuild.mjs` ->
`scripts/build-helper.mjs#updatePackageJson`). Both files must therefore be
bumped together, or the root version will silently overwrite the version set
in `packages/primeng/package.json` on the next build.

### 1. Update the version

Bump the version in **both**:

* `package.json` (repo root)
* `packages/primeng/package.json`

to the same value, for example:

```text
18.0.2-amarris.2
```

### 2. Commit the changes

```bash
git add package.json packages/primeng/package.json
git commit -m "Release 18.0.2-amarris.2"
git push origin amarris-tech-v18
```

### 3. Create a release tag

```bash
git tag v18.0.2-amarris.2
git push origin v18.0.2-amarris.2
```

Pushing the tag automatically starts the GitHub Actions workflow defined in
`.github/workflows/publish-package.yml`.

## What the workflow does

The workflow automatically:

1. Installs dependencies with `pnpm install`.
2. Builds the PrimeNG library with `pnpm run build:lib` (output goes to
   `packages/primeng/dist`).
3. Runs `node packages/primeng/scripts/prepare-package.js`, which:
   * renames the package from `primeng` to `@amarris-tech/primeng` in
     `packages/primeng/dist/package.json`,
   * rewrites internal cross-entry-point import specifiers (e.g.
     `from 'primeng/api'`) to the scoped name (`from '@amarris-tech/primeng/api'`)
     across the built `.mjs`/`.js`/`.d.ts` files,
   * sets `publishConfig.registry` to `https://npm.pkg.github.com`.
4. Publishes the contents of `packages/primeng/dist/` to GitHub Packages.

No manual `npm publish` is required.

Note: the source package at `packages/primeng/package.json` deliberately
keeps the name `primeng` (not `@amarris-tech/primeng`) so the rest of the
monorepo's build tooling, which references the bare `primeng` package
internally (e.g. the showcase app, themes package), keeps working
unmodified. Only the built output in `dist/` is renamed, by the prepare
script, right before publishing.

## Verifying the release

Check the GitHub Actions workflow:

* Repository -> **Actions**
* Ensure the workflow completed successfully.

Then verify the published version:

```bash
npm view @amarris-tech/primeng version --registry=https://npm.pkg.github.com
```

or install it:

```bash
npm install @amarris-tech/primeng@18.0.2-amarris.2
```

## Using the package

Projects consuming this package should contain a `.npmrc` file with:

```text
@amarris-tech:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

The `GITHUB_TOKEN` environment variable must contain a GitHub PAT with
permission to read packages.

The `GITHUB_TOKEN` should be stored in a `.env` file in the consuming
project's root (this file should be gitignored and never committed), for
example:

```text
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
