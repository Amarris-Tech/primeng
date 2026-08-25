const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

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

const pkg = JSON.parse(fs.readFileSync(path.join(DIST, 'package.json')));

pkg.name = '@amarris-tech/primeng';

pkg.publishConfig = {
    ...pkg.publishConfig,
    registry: 'https://npm.pkg.github.com'
};

fs.writeFileSync(path.join(DIST, 'package.json'), JSON.stringify(pkg, null, 2));

console.log('Package prepared.');
