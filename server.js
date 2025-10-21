import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.wasm': 'application/wasm',
    '.css': 'text/css',
    '.json': 'application/json'
};

const server = createServer((req, res) => {
    let filePath = join(__dirname, req.url === '/' ? '/test.html' : req.url);

    // Handle pkg directory requests
    if (req.url.startsWith('/pkg/')) {
        filePath = join(__dirname, req.url);
    }

    if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end('File not found');
        return;
    }

    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';

    try {
        const content = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        res.writeHead(500);
        res.end('Server error');
    }
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open http://localhost:${PORT}/test.html to test the WASM module`);
});
