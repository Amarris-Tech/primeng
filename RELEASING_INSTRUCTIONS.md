# Releasing `@amarris-tech/primeng`

This repository contains the Amarris fork of PrimeNG v17.

Packages are published to **GitHub Packages** under the scope:

```text
@amarris-tech/primeng
```

## Prerequisites

* Write access to this repository.
* A GitHub Personal Access Token (PAT) with `write:packages` permission.
* The PAT stored as the `GH_PACKAGES_TOKEN` repository secret.
* GitHub Actions enabled.

## Release process

### 1. Update the package version

Update the version that will be published (for example) in src/app/components/package.json:

17.18.15-amarris.2

### 2. Commit the changes

```bash
git add .
git commit -m "Release 17.18.15-amarris.2"
git push origin amarris-tech-v17
```

### 3. Create a release tag

```bash
git tag v17.18.15-amarris.2
git push origin v17.18.15-amarris.2
```

Pushing the tag automatically starts the GitHub Actions workflow.

## What the workflow does

The workflow automatically:

1. Installs dependencies.
2. Builds the PrimeNG library.
3. Runs `scripts/prepare-package.js`.
4. Publishes the contents of `dist/` to GitHub Packages.

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
npm install @amarris-tech/primeng@17.18.15-amarris.2
```

## Using the package

Projects consuming this package should contain:

@amarris-tech:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}


The `GITHUB_TOKEN` environment variable must contain a GitHub PAT with permission to read packages.

The GITHUB_TOKEN shoulb be stored in a .env file in the project root (should be in gitignore, and not committed), for example:

```text
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
``` 

Add that in a `.npmrc` file in the project root.
