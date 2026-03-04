# McpHelloWorld

Minimal Shopware app demonstrating MCP tool integration via webhook.

Part of the [MCP Server POC](https://github.com/shopware/shopware/pull/15346) for Shopware.

## What it does

Registers a single MCP tool (`McpHelloWorld-hello`) that returns a greeting. The tool call is proxied from Shopware to a Node.js webhook server via HMAC-signed HTTP POST.

## Setup

```bash
# Start the webhook server
node server.js

# Install the app
bin/console app:install --activate McpHelloWorld
```

## Files

- `manifest.xml` -- App metadata and registration endpoint
- `Resources/mcp.xml` -- MCP tool definition with input schema
- `server.js` -- Webhook server handling registration, confirmation, and tool calls
