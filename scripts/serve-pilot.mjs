// Serves a voice-pilot folder on http://localhost:5301 so the listening page
// and its MP3s open in a browser (file:// pages often can't play local audio).
// Usage: node scripts/serve-pilot.mjs [folder]   (default: audio-pilot-edge)

import http from 'http';
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', process.argv[2] ?? 'audio-pilot-edge');
const port = Number(process.env.PORT ?? 5301);
const types = { '.html': 'text/html; charset=utf-8', '.mp3': 'audio/mpeg' };

http
  .createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
    let file = path.join(root, rel);
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }
    const size = statSync(file).size;
    const type = types[path.extname(file)] ?? 'application/octet-stream';
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Number(range[2]) : size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
      createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': size });
      createReadStream(file).pipe(res);
    }
  })
  .listen(port, () => console.log(`Voice pilot: http://localhost:${port}  (serving ${root})`));
