// Local preview of the built site with real page paths (/, /about, /book).
//   node build.mjs && node preview-server.mjs     then open http://localhost:4321
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4321;
const pages = { '/': 'home', '/about': 'about', '/book': 'book', '/resources': 'resources' };
const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/+$/, '') || '/';
  if (pages[url]) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(fs.readFileSync(path.join(root, 'dist/preview', pages[url] + '.html')));
  }
  if (url.startsWith('/src/img/')) {
    const file = path.join(root, 'src/img', path.basename(url));
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      return res.end(fs.readFileSync(file));
    }
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found. Pages: ' + Object.keys(pages).join('  '));
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}   (pages: ${Object.keys(pages).join(', ')})`));
