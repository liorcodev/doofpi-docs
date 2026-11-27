// Nitro can prerender `/` twice and write index.html concurrently. When the two
// outputs differ in length, the tail of the longer one survives after the final
// `</html>` and browsers render it as visible text until the app mounts.
// Run after `nuxt generate` to cut every generated page at its first `</html>`.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../.output/public/', import.meta.url));
const CLOSING_TAG = '</html>';

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'assets' && entry.name !== '_fonts') yield* htmlFiles(path);
    } else if (entry.name.endsWith('.html')) {
      yield path;
    }
  }
}

let trimmed = 0;
for await (const file of htmlFiles(root)) {
  const html = await readFile(file, 'utf8');
  const end = html.indexOf(CLOSING_TAG);
  if (end === -1) continue;
  const clean = html.slice(0, end + CLOSING_TAG.length);
  if (clean.length === html.length) continue;
  await writeFile(file, clean);
  trimmed++;
  console.log(`Trimmed trailing content from ${file.slice(root.length)}`);
}
console.log(`trim-html: ${trimmed} file(s) fixed`);
