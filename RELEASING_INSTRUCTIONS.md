# Releasing `@amarris-tech/primeng`

This branch (`amarris-tech-v21`) is our fork of PrimeNG's `packages/primeng` library,
published to GitHub Packages as `@amarris-tech/primeng`.

Important: unlike the v17 fork, there is no dedicated `v21` branch upstream — as of this
writing `origin/master` in `primefaces/primeng` **is** the v21 codebase. This branch was
created from `origin/master`, so pulling upstream updates means rebasing/merging from
`master`, not from a `v21` branch.

## Repo layout (pnpm monorepo)

This is a pnpm workspace, not the plain Angular-CLI layout the v17 fork uses:

- Root `package.json` — monorepo metadata, `packageManager` pin, and the `build:lib`
  script (`pnpm --filter primeng build`).
- `packages/primeng/package.json` — the publishable library's manifest.
- `packages/primeng/scripts/prebuild.mjs` / `postbuild.mjs` — ng-packagr pre/post steps
  (via the shared helper at `scripts/build-helper.mjs`).
- `packages/primeng/dist/` — build output; this is what actually gets published.
- `scripts/prepare-package.js` — our fork-specific post-build step (see below).
- `.github/workflows/publish-package.yml` — the publish workflow, triggered by `v*` tags.

## Important gotcha: version/repository/bugs are synced FROM the root package.json

`scripts/build-helper.mjs`'s `updatePackageJson()` runs during `packages/primeng`'s
prebuild step and **overwrites** `packages/primeng/package.json`'s `version`, `author`,
`homepage`, `license`, `repository`, and `bugs` fields with whatever is in the **root**
`package.json` (repository/bugs are merged, but `url` from root wins on conflict; version
is copied outright). This is how upstream normally keeps these fields in sync across the
monorepo during its own release process (see any `chore: update version` commit — it
touches both `package.json` and `packages/primeng/package.json` together).

Practical consequence for us: **you must bump the version (and keep the
`Amarris-Tech/primeng` repository/bugs URLs) in BOTH files, kept identical**:

- `package.json` (root)
- `packages/primeng/package.json`

If you only bump `packages/primeng/package.json`, the next build silently resets it back
to whatever the root says.

## Release steps

1. Decide the new version, following `<upstream-version>-amarris.N`
   (e.g. `21.1.9-amarris.2` for the next patch on top of upstream `21.1.9`, or
   `21.2.0-amarris.1` after picking up a new upstream version).
2. Bump `"version"` to that value in **both**:
   - `package.json` (root)
   - `packages/primeng/package.json`
3. Commit the version bump:
   ```bash
   git add package.json packages/primeng/package.json
   git commit -m "chore: bump @amarris-tech/primeng to <version>"
   ```
4. Push the commit to this fork branch:
   ```bash
   git push origin amarris-tech-v21
   ```
5. Create and push a matching tag (this is what triggers the publish workflow):
   ```bash
   git tag v<version>
   git push origin v<version>
   ```
   e.g. `git tag v21.1.9-amarris.2 && git push origin v21.1.9-amarris.2`.
6. The `Publish PrimeNG Fork` workflow (`.github/workflows/publish-package.yml`) then:
   - checks out the repo and sets up pnpm/Node 20,
   - runs `pnpm install --frozen-lockfile`,
   - runs `pnpm run build:lib` (builds `packages/primeng` via ng-packagr into
     `packages/primeng/dist`),
   - runs `node scripts/prepare-package.js`, which:
     - rewrites any `from 'primeng...'` import specifiers in the built `.mjs`/`.js`/`.d.ts`
       files to `from '@amarris-tech/primeng...'`,
     - renames the package in `packages/primeng/dist/package.json` to
       `@amarris-tech/primeng`,
     - adds `publishConfig.registry: https://npm.pkg.github.com` to that same file
       (preserving the existing `publishConfig.access`),
   - publishes from `packages/primeng/dist` with
     `npm publish --registry=https://npm.pkg.github.com`, authenticated via the
     `PAT_PUBLISH` repository secret (a GitHub PAT with `write:packages` scope).

## Notes

- The **source** package name in `packages/primeng/package.json` is deliberately left as
  `"primeng"` — only the build output (`packages/primeng/dist/package.json`) is renamed to
  the scoped `@amarris-tech/primeng` name. This keeps the rest of the monorepo's tooling
  (which references the bare `primeng` package internally, e.g. via the `primeng` filter
  in pnpm scripts) working unmodified.
- `packages/primeng/package.json`'s `publishConfig` already carries `directory: "dist"` /
  `linkDirectory: false` for local `pnpm link`/`pnpm publish` workflows; `build-helper.mjs`'s
  `clearPackageJson()` strips those two keys (but no others) out of the ng-packagr input
  copy, which is why the `registry` key we added survives all the way into the built
  `packages/primeng/dist/package.json`.
- Consumers install with (assuming a `.npmrc` pointing the `@amarris-tech` scope at GitHub
  Packages):
  ```
  @amarris-tech:registry=https://npm.pkg.github.com
  ```
  ```bash
  npm install @amarris-tech/primeng@<version>
  ```
