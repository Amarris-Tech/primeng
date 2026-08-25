# Releasing `@amarris-tech/primeng`

This repository contains the Amarris fork of PrimeNG v19.

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

### 1. Update the package version

This is a pnpm workspace. The publishable library lives at `packages/primeng`, but
its version, repository and bugs URLs are taken from the **workspace root**
`package.json` at build time (see `scripts/build-helper.mjs` / `updatePackageJson`),
so update the version there (and keep `packages/primeng/package.json` in sync for
clarity):

```text
"version": "19.1.4-amarris.2"
```

in both:

* `package.json` (workspace root)
* `packages/primeng/package.json`

### 2. Commit the changes

```bash
git add .
git commit -m "Release 19.1.4-amarris.2"
git push origin amarris-tech-v19
```

### 3. Create a release tag

```bash
git tag v19.1.4-amarris.2
git push origin v19.1.4-amarris.2
```

Pushing the tag automatically starts the GitHub Actions workflow
(`.github/workflows/publish-package.yml`).

## What the workflow does

The workflow automatically:

1. Installs dependencies with `pnpm install --frozen-lockfile`.
2. Builds the PrimeNG library with `pnpm run build:lib` (equivalent to
   `pnpm --filter primeng build`), producing `packages/primeng/dist`.
3. Runs `node scripts/prepare-package.js`, which:
   * renames the package to `@amarris-tech/primeng` in `packages/primeng/dist/package.json`,
   * rewrites internal cross-entry-point import/export specifiers
     (e.g. `primeng/api`, `primeng/icons/check`) to `@amarris-tech/primeng/...`
     in every built `.mjs`/`.js`/`.d.ts` file.
4. Publishes the contents of `packages/primeng/dist` to GitHub Packages.

No manual `npm publish` is required.

## Verifying the release

Check the GitHub Actions workflow:

* Repository → **Actions**
* Ensure the workflow completed successfully.

Then verify the published version:

```bash
npm view @amarris-tech/primeng version --registry=https://npm.pkg.github.com
```

or install it:

```bash
npm install @amarris-tech/primeng@19.1.4-amarris.2
```

## Using the package

Projects consuming this package should contain a `.npmrc` file in the project root:

```text
@amarris-tech:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

The `GITHUB_TOKEN` environment variable must contain a GitHub PAT with permission
to read packages.

The `GITHUB_TOKEN` should be stored in a `.env` file in the project root (should be
in `.gitignore`, and not committed), for example:

```text
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
