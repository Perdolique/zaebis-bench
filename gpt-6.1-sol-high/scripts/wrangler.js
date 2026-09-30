import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const stateDirectory = fileURLToPath(new URL('../.deploy-state/', import.meta.url));
mkdirSync(stateDirectory, { recursive: true, mode: 0o700 });

// Keep generated files local, but use the user's regular Wrangler login.
const child = spawn(process.execPath, [
  fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url)),
  ...process.argv.slice(2),
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    XDG_CACHE_HOME: `${stateDirectory}cache`,
    WRANGLER_LOG_PATH: `${stateDirectory}logs/`,
    WRANGLER_SEND_METRICS: 'false',
  },
});

child.on('error', error => {
  console.error('Could not start Wrangler', error);
  process.exitCode = 1;
});
child.on('exit', code => {
  process.exitCode = code ?? 1;
});
