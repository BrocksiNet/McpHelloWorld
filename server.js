const http = require('http');
const crypto = require('crypto');
const url = require('url');

const APP_SECRET = 'test-secret-for-mcp-hello-world';
const PORT = 3333;

let requestCount = 0;

const server = http.createServer((req, res) => {
    requestCount++;
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

        if (pathname === '/mcp/ping') {
            const data = body ? JSON.parse(body) : {};
            console.log('MCP tool call:', JSON.stringify(data, null, 2));

            const message = data.arguments?.message ?? null;
            const response = {
                pong: true,
                echo: message,
                timestamp: new Date().toISOString(),
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            return;
        }

        if (pathname === '/mcp/prompt/greeting-context') {
            const response = [
                { role: 'user', content: 'You are interacting with the McpHelloWorld app. Use the "hello" tool to greet users by name, and "ping" to check connectivity.' },
                { role: 'user', content: 'Always be friendly and include a timestamp in your responses.' },
            ];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            return;
        }

        if (pathname === '/mcp/prompt/usage-guide') {
            const response = [
                { role: 'user', content: 'Step 1: Use "ping" with no arguments to verify the app is reachable.' },
                { role: 'user', content: 'Step 2: Use "hello" with a "name" argument to get a personalized greeting.' },
            ];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            return;
        }

        if (pathname === '/mcp/resource/status') {
            const response = {
                uri: 'mcp-hello-world://status',
                mimeType: 'application/json',
                text: JSON.stringify({
                    status: 'running',
                    port: PORT,
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString(),
                }),
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            return;
        }

        if (pathname === '/mcp/resource/stats') {
            const response = {
                uri: 'mcp-hello-world://stats',
                mimeType: 'application/json',
                text: JSON.stringify({
                    totalRequests: requestCount,
                    timestamp: new Date().toISOString(),
                }),
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
