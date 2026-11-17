
import { createServer } from 'node:http';

const todos = [
    { id: 1, title: 'Learn Playwright', completed: false },
    { id: 2, title: 'Learn k6', completed: true },
];

const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }

    if (req.method === 'GET' && req.url === '/api/todos') {
        res.writeHead(200);
        res.end(JSON.stringify(todos));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(8080, '0.0.0.0', () => {
    console.log('Test API listening on port 8080');
});
