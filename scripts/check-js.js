const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const roots = process.argv.slice(2);
const targets = roots.length > 0 ? roots : ['backend', 'scripts', 'eslint.config.js'];
const ignored = new Set(['node_modules', 'coverage', 'dist', 'build', '.cache', '.git']);

function walk(entry, files) {
  const absolute = path.resolve(entry);
  if (!fs.existsSync(absolute)) {
    return files;
  }

  const stat = fs.statSync(absolute);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(absolute)) {
      if (!ignored.has(child)) {
        walk(path.join(absolute, child), files);
      }
    }
    return files;
  }

  if (absolute.endsWith('.js') || absolute.endsWith('.cjs')) {
    files.push(absolute);
  }

  return files;
}

const files = targets.flatMap((target) => walk(target, []));

for (const file of files) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}
