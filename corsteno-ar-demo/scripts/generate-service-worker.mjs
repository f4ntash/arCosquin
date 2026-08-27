import { readdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';

const distDir = fileURLToPath(new URL('../dist', import.meta.url));
const requiredUrls = ['/', '/index.html', '/targets/cosquin-rock.mind'];
const excludedFiles = new Set(['sw.js']);

const toUrlPath = (filePath) => `/${relative(distDir, filePath).split(sep).join('/')}`;

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(fullPath);
      if (excludedFiles.has(entry.name)) return [];
      return [fullPath];
    }),
  );

  return files.flat();
};

const files = await collectFiles(distDir);
const fileStats = await Promise.all(files.map((file) => stat(file)));
const versionSource = fileStats.map((item) => `${item.size}-${item.mtimeMs}`).join('|');
const versionHash = Buffer.from(versionSource).toString('base64url').slice(0, 16);
const precacheUrls = Array.from(new Set([...requiredUrls, ...files.map(toUrlPath)])).sort();

const serviceWorker = `const CACHE_VERSION = 'corsteno-ar-demo-${versionHash}';
const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};
const APP_SHELL_URL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('corsteno-ar-demo-') && cacheName !== CACHE_VERSION)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(APP_SHELL_URL, copy));
          return response;
        })
        .catch(() => caches.match(APP_SHELL_URL)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
`;

await writeFile(new URL('../dist/sw.js', import.meta.url), serviceWorker);
console.log(`Generated dist/sw.js with ${precacheUrls.length} precached URLs.`);
