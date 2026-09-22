const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5173;
const CLIENT_ROOT = path.resolve(__dirname);
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const requestPath = req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0];
  // Serve Vite dev assets (during dev, Vite serves modules). If a built app exists, serve it.
  // Simple mock API for frontend development
  if (requestPath.startsWith('/api/')) {
    // collect body
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (requestPath === '/api/register' && req.method === 'POST') {
          // return fake token
          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ token: 'dev-token-' + Date.now() }));
          return;
        }
        if (requestPath === '/api/login' && req.method === 'POST') {
          // accept any credentials for dev
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ token: 'dev-token-' + Date.now() }));
          return;
        }
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ message: 'Not found' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ message: 'Bad request' }));
      }
    });
    return;
  }
  const filePath = path.resolve(CLIENT_ROOT, `.${requestPath}`);
  if (!filePath.startsWith(`${CLIENT_ROOT}${path.sep}`)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing frontend, or run with a different port:`);
    console.error(`  $env:PORT=${Number(PORT) + 1}; npm run dev`);
    process.exit(1);
  }
  throw error;
});

server.listen(PORT, () => console.log(`Frontend running at http://localhost:${PORT}`));
