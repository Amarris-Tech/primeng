// Prepares the built `primeng` package (packages/primeng/dist) for publishing
// as the scoped fork `@amarris-tech/primeng` to GitHub Packages.
//
// This intentionally does NOT rename the source package (packages/primeng/package.json
// keeps "name": "primeng") so that the rest of the monorepo's build/tooling, which
// references the bare "primeng" package name internally (workspace deps, ng-packagr,
// the showcase app, etc.), keeps working unmodified. The rename + import-specifier
// rewrite happens here, post-build, on the dist output only.
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
            text = text.replace(/from ['"]primeng(\/[^'"]*)?['"]/g, (_, p = '') => `from '@amarris-tech/primeng${p}'`);
            fs.writeFileSync(full, text);
        }
    }
}

walk(DIST);

const pkgPath = path.join(DIST, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = '@amarris-tech/primeng';
pkg.publishConfig = { registry: 'https://npm.pkg.github.com' };
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log('Package prepared.');
