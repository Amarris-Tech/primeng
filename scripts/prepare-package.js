/**
 * Post-build step for publishing the Amarris-Tech fork of PrimeNG to GitHub Packages.
 *
 * The source package (packages/primeng/package.json) deliberately keeps the
 * unscoped name "primeng" so the rest of the monorepo's build tooling (which
 * references bare "primeng" internally, e.g. secondary entry points and
 * cross-package imports) keeps working unmodified. This script instead
 * operates on the ng-packagr *build output* (packages/primeng/dist):
 *   - renames the package to the scoped name "@amarris-tech/primeng"
 *   - rewrites internal cross-entry-point import/export specifiers
 *     (e.g. "primeng/api", "primeng/icons/check") to the scoped equivalent
 *     in every built .mjs/.js/.d.ts file
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'packages', 'primeng', 'dist');

function walk(dir) {
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            walk(full);
            continue;
        }
        if (full.endsWith('.mjs') || full.endsWith('.js') || full.endsWith('.d.ts')) {
            let text = fs.readFileSync(full, 'utf8');
            const updated = text.replace(/from ['"]primeng(\/[^'"]*)?['"]/g, (_, p = '') => `from '@amarris-tech/primeng${p}'`);
            if (updated !== text) {
                fs.writeFileSync(full, updated);
            }
        }
    }
}

walk(DIST);

const pkgPath = path.join(DIST, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = '@amarris-tech/primeng';
pkg.publishConfig = { ...pkg.publishConfig, registry: 'https://npm.pkg.github.com' };
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log('Package prepared.');
