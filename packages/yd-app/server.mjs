import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const projectRoot = path.join(__dirname, '..', '..');

function isSubpath(parent, child) {
  const relative = path.relative(parent, child);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

async function resolveFile(requestPath) {
  const normalized = path.posix.normalize(requestPath);
  const safePath = normalized.startsWith('/') ? normalized : `/${normalized}`;

  if (safePath === '/' || safePath === '/index.html') {
    const candidate = path.join(publicDir, 'index.html');
    const exists = await fileExists(candidate);
    return exists ? candidate : null;
  }

  const relativePath = safePath.slice(1);

  const fromPublic = path.join(publicDir, relativePath);
  if (isSubpath(publicDir, fromPublic) && (await fileExists(fromPublic))) {
    return fromPublic;
  }

  const fromRoot = path.join(projectRoot, relativePath);
  if (isSubpath(projectRoot, fromRoot) && (await fileExists(fromRoot))) {
    return fromRoot;
  }

  return null;
}

async function fileExists(target) {
  try {
    const stats = await fs.stat(target);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=UTF-8'],
  ['.js', 'application/javascript; charset=UTF-8'],
  ['.mjs', 'application/javascript; charset=UTF-8'],
  ['.css', 'text/css; charset=UTF-8'],
  ['.json', 'application/json; charset=UTF-8'],
  ['.svg', 'image/svg+xml'],
]);

function getMimeType(filePath) {
  const ext = path.extname(filePath);
  return MIME_TYPES.get(ext) ?? 'application/octet-stream';
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const filePath = await resolveFile(url.pathname);

  if (!filePath) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.end('Not found');
    return;
  }

  try {
    const contents = await fs.readFile(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', getMimeType(filePath));
    res.end(contents);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.end(`Failed to read file: ${error.message}`);
  }
});

const port = Number.parseInt(process.env.PORT ?? '4173', 10);

server.listen(port, () => {
  console.log(`Development server running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop.');
});
