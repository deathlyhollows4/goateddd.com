import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to recursively find all index.html pages (excluding templates, node_modules, and builds)
function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git' && file !== '.claude' && file !== '.antigravitycli' && file !== 'templates') {
        getHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const htmlFiles = getHtmlFiles(__dirname);
const input = {};
htmlFiles.forEach(file => {
  const relativePath = path.relative(__dirname, file);
  // Ensure we map standard name keys
  const name = relativePath.replace(/\.html$/, '').replace(/[/\\]/g, '_') || 'main';
  input[name] = file;
});

console.log('[Vite Build] Registered HTML entry points:', Object.keys(input));

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: input
    }
  }
});
