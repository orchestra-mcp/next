import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const srcDir = resolve(__dirname, '..', 'src');

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walk(full));
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

const srcFiles = walk(srcDir);
let count = 0;

for (const srcFile of srcFiles) {
  const content = readFileSync(srcFile, 'utf-8');
  if (!content.startsWith('"use client"')) continue;

  // Map src path to dist .js path
  const relative = srcFile.slice(srcDir.length);
  const distFile = resolve(distDir, relative.replace(/\.tsx?$/, '.js'));

  try {
    const distContent = readFileSync(distFile, 'utf-8');
    if (!distContent.startsWith('"use client"')) {
      writeFileSync(distFile, `"use client";\n\n${distContent}`);
      count++;
    }
  } catch {
    // dist file may not exist (test/story files excluded)
  }
}

console.log(`Injected "use client" into ${count} dist files.`);
