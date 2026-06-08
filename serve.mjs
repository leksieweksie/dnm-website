import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.resolve(__dirname, `.${urlPath}`);
  if (filePath !== __dirname && !filePath.startsWith(`${__dirname}${path.sep}`)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const headers = {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    };
    const compressible = ['.html', '.css', '.js', '.mjs', '.json', '.svg'].includes(ext) && data.length > 1024;
    const accepts = req.headers['accept-encoding'] || '';

    if (compressible && accepts.includes('br')) {
      zlib.brotliCompress(data, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }, (zipErr, zipped) => {
        if (zipErr) {
          res.writeHead(200, headers);
          res.end(data);
          return;
        }
        res.writeHead(200, { ...headers, 'Content-Encoding': 'br', Vary: 'Accept-Encoding' });
        res.end(zipped);
      });
      return;
    }

    if (compressible && accepts.includes('gzip')) {
      zlib.gzip(data, { level: 6 }, (zipErr, zipped) => {
        if (zipErr) {
          res.writeHead(200, headers);
          res.end(data);
          return;
        }
        res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
        res.end(zipped);
      });
      return;
    }

    res.writeHead(200, headers);
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`DNM server running at http://localhost:${PORT}`);
});
