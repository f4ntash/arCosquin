import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const localEnvPath = resolve(root, '.env.local');

// Vite loads .env.local for production builds too. Keep local credentials out
// of the public bundle unless the deploy explicitly supplies its own env vars.
try {
  const localEnv = readFileSync(localEnvPath, 'utf8');
  for (const line of localEnv.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?((?:VITE|NEXT_PUBLIC)_[A-Za-z0-9_]+)\s*=/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = '';
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const run = (script, args = []) => {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run(resolve(root, 'node_modules/typescript/bin/tsc'));
run(resolve(root, 'node_modules/vite/bin/vite.js'), ['build']);
await import('./generate-service-worker.mjs');
