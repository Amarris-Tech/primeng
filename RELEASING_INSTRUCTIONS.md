# Releasing @amarris-tech/primeng

This repository is a fork of [PrimeNG](https://github.com/primefaces/primeng) published under the
scoped package name `@amarris-tech/primeng` to GitHub Packages.

The source package at `packages/primeng` keeps its upstream name `primeng` unchanged, so the rest
of the pnpm workspace (the showcase app, themes package, internal cross-imports like
`from 'primeng/button'`, etc.) keeps working without modification. The rename to
`@amarris-tech/primeng` and the rewrite of internal `primeng/...` import specifiers to
`@amarris-tech/primeng/...` happen post-build, on the built output in `packages/primeng/dist` only,
via `scripts/prepare-package.js`.

## How to cut a release

1. Bump the version in **both**:
   - `package.json` (repo root)
   - `packages/primeng/package.json`

   Use the `<upstream-version>-amarris.N` scheme, e.g. `20.4.0-amarris.2`.

   Both files must be bumped together: `packages/primeng/scripts/prebuild.mjs` copies
   `version`, `repository`, and `bugs` from the **root** `package.json` onto
   `packages/primeng/package.json` every time the library is built (see
   `scripts/build-helper.mjs#updatePackageJson`), overwriting whatever is there. If only the
   nested package.json is bumped, the build will silently reset it back to the root's version.

2. Commit the version bump.

3. Push to the `amarris-tech-v20` branch.

4. Create and push a tag matching `vX.Y.Z-amarris.N`, e.g.:

   ```sh
   git tag v20.4.0-amarris.2
   git push origin v20.4.0-amarris.2
   ```

   Pushing the tag triggers `.github/workflows/publish-package.yml`, which:
   - installs dependencies with pnpm
   - builds the library (`pnpm run build:lib`, i.e. `pnpm --filter primeng build`)
   - runs `node scripts/prepare-package.js` to rename the built package to
     `@amarris-tech/primeng` and rewrite its internal import specifiers
   - publishes `packages/primeng/dist` to `https://npm.pkg.github.com`

## Required secret

The workflow publishes using the `PAT_PUBLISH` repository secret — a GitHub Personal Access Token
with `write:packages` (and `repo` if the package repo is private) scope, configured under
**Settings → Secrets and variables → Actions** for this repository.

## Consuming the package

Add to `.npmrc` in the consuming project:

```
@amarris-tech:registry=https://npm.pkg.github.com
```

Then install as usual:

```sh
npm install @amarris-tech/primeng
```

## Local build/validation (without publishing)

```sh
pnpm install
pnpm run build:lib
node scripts/prepare-package.js
```

This produces the ready-to-publish package at `packages/primeng/dist`, with
`packages/primeng/dist/package.json` renamed to `@amarris-tech/primeng` and all built
`.mjs`/`.js`/`.d.ts` files rewritten to import from `@amarris-tech/primeng/...` instead of
`primeng/...`.

Note: building the full library is memory-hungry (ng-packagr compiles 80+ entry points). If the
build fails with a JavaScript heap out-of-memory error, increase Node's heap size, e.g.:

```sh
NODE_OPTIONS="--max-old-space-size=8192" pnpm run build:lib
```
