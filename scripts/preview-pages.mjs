// Serves .output/public under the same /<repo>/ subpath GitHub Pages uses in
// production, since `nuxt preview` serves it at the domain root and every
// asset link (baked in at build time with `app.baseURL`) 404s as a result.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../.output/public/', import.meta.url));
const configText = await readFile(fileURLToPath(new URL('../nuxt.config.ts', import.meta.url)), 'utf8');
const baseURL = (configText.match(/baseURL:\s*['"]([^'"]+)['"]/)?.[1] ?? '/').replace(/\/+$/, '') || '';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

const PORT = process.env.PORT ?? 3000;

const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  if (pathname !== baseURL && !pathname.startsWith(`${baseURL}/`)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`Not found. This preview only serves paths under ${baseURL}/ (mirrors GitHub Pages).`);
    return;
  }

  let rel = pathname.slice(baseURL.length) || '/';
  if (rel.endsWith('/')) rel += 'index.html';
  let filePath = join(root, rel);

  try {
    if ((await stat(filePath)).isDirectory()) filePath = join(filePath, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
    res.end(await readFile(filePath));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await readFile(join(root, '404.html')));
  }
});

server.listen(PORT, () => {
  console.log(`Previewing GitHub Pages build at http://localhost:${PORT}${baseURL}/`);
});
