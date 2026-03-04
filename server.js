const http = require('http');
const crypto = require('crypto');
const url = require('url');

const APP_SECRET = 'test-secret-for-mcp-hello-world';
const PORT = 3333;

const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
        const parsed = url.parse(req.url, true);
        const pathname = parsed.pathname;
        console.log(`${req.method} ${req.url}`);

        if (pathname === '/register' && req.method === 'GET') {
            const shopId = parsed.query['shop-id'];
            const shopUrl = parsed.query['shop-url'];

            const proof = crypto
                .createHmac('sha256', APP_SECRET)
                .update(shopId + shopUrl + 'McpHelloWorld')
                .digest('hex');

            const response = {
                proof,
                secret: APP_SECRET,
                confirmation_url: `http://host.docker.internal:${PORT}/confirm`,
            };
            console.log('Registration response:', response);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            return;
        }

        if (pathname === '/confirm') {
            console.log('Confirmation body:', body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{}');
            return;
        }

        if (pathname === '/mcp/hello') {
            const data = body ? JSON.parse(body) : {};
            console.log('MCP tool call:', JSON.stringify(data, null, 2));

            const name = data.arguments?.name || 'World';
            const response = {
                message: `Hello, ${name}! Greetings from the McpHelloWorld app.`,
                timestamp: new Date().toISOString(),
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            return;
        }

        console.log('404 for:', pathname);
        res.writeHead(404);
        res.end('Not found');
    });
});

server.listen(PORT, () => {
    console.log(`MCP Hello World app server running on port ${PORT}`);
});
