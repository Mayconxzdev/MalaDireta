const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const markdownFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.md')) markdownFiles.push(full);
  }
}

walk(root);
const failures = [];
for (const file of markdownFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, '');
    if (/^(https?:|mailto:|#)/i.test(target)) continue;
    const clean = decodeURIComponent(target.split('#')[0]);
    if (!fs.existsSync(path.resolve(path.dirname(file), clean))) {
      failures.push(`${path.relative(root, file)} -> ${target}`);
    }
  }
}

if (failures.length) {
  console.error(`Links locais quebrados:\n${failures.join('\n')}`);
  process.exit(1);
}

console.log(`OK ${markdownFiles.length} arquivos Markdown sem links locais quebrados.`);
