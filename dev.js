const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

console.log('🌾 Starting MaatiKatha Full-Stack Development Environment...\n');

// 1. Spawn Backend Server
const serverProcess = spawn('node server.js', {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

// 2. Spawn Vite Frontend
const clientProcess = spawn('npx vite --host', {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true
});

// Cleanup on exit
function shutdown() {
  console.log('\n🛑 Shutting down MaatiKatha services...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

serverProcess.on('error', (err) => console.error('[Server Error]:', err));
clientProcess.on('error', (err) => console.error('[Client Error]:', err));
