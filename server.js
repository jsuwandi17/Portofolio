/**
 * JAENUDIN SUWANDI — MULTI-PAGE LOCAL SERVER & REST API
 * Zero-dependency native Node.js HTTP server.
 * Handles clean multi-page routing and the POST /api/save-content endpoint.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'content.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS Headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // =========================================================================
  // REST API: POST /api/save-content
  // =========================================================================
  if (req.method === 'POST' && req.url === '/api/save-content') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Content saved to disk successfully!' }));
        console.log('[Server] Successfully updated data/content.json');
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
        console.error('[Server] Failed to save content:', err);
      }
    });
    return;
  }

  // =========================================================================
  // Static File Serving & Clean Route Resolution
  // =========================================================================
  let reqPath = req.url.split('?')[0];

  // Route aliases
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  } else if (reqPath === '/portfolio') {
    reqPath = '/portfolio.html';
  } else if (reqPath === '/experience') {
    reqPath = '/experience.html';
  } else if (reqPath === '/contact') {
    reqPath = '/contact.html';
  } else if (reqPath === '/admin' || reqPath === '/admin/') {
    reqPath = '/admin/index.html';
  }

  const filePath = path.join(ROOT, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 Not Found</h1><p>The requested route does not exist.</p><a href="/">Back to Home</a>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`Jaenudin Suwandi Portfolio Server`);
  console.log(`Local URL:   http://localhost:${PORT}`);
  console.log(`Portfolio:   http://localhost:${PORT}/portfolio`);
  console.log(`Experience:  http://localhost:${PORT}/experience`);
  console.log(`Contact:     http://localhost:${PORT}/contact`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`======================================================\n`);
});
