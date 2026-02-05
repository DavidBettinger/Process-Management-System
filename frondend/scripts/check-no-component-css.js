/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..', 'src', 'app');
const forbiddenSuffixes = ['.component.css', '.component.scss'];

const allowlist = new Set([
  // Add temporary exceptions here if a component still requires legacy CSS.
]);

if (!fs.existsSync(appRoot)) {
  console.error(`Expected app root not found: ${appRoot}`);
  process.exit(1);
}

const violations = [];

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (!forbiddenSuffixes.some((suffix) => fullPath.endsWith(suffix))) {
      continue;
    }
    const relativePath = path.relative(appRoot, fullPath).split(path.sep).join('/');
    if (!allowlist.has(relativePath)) {
      violations.push(relativePath);
    }
  }
};

walk(appRoot);

if (violations.length > 0) {
  console.error('New component CSS/SCSS files are not allowed:');
  for (const file of violations) {
    console.error(`- ${file}`);
  }
  console.error('Migrate styles to Tailwind or add a temporary allowlist entry.');
  process.exit(1);
}

console.log('Style guard passed: no new component CSS/SCSS files found.');
