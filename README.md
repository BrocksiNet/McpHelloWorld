# McpHelloWorld

Minimal Shopware app demonstrating MCP integration with **both extension patterns side-by-side**:

1. **App scripts** — Shopware app scripts (Twig + DAL, in-process, no external server)
2. **Node.js webhook** — external HTTP server receiving HMAC-signed POSTs

Part of the [MCP Server POC](https://github.com/shopware/shopware/pull/15346) for Shopware.

## Tools, prompts and resources exposed

| Name | Pattern | Backing |
|---|---|---|
| `McpHelloWorld-hello` | app script | `Resources/scripts/api-mcp-hello-world-hello/hello.twig` |
| `McpHelloWorld-ping` | app script | `Resources/scripts/api-mcp-hello-world-ping/ping.twig` |
| `McpHelloWorld-product-count` | app script | `Resources/scripts/api-mcp-hello-world-product-count/count.twig` |
| `McpHelloWorld-hello-webhook` | Node.js webhook | `server.js` → `/mcp/hello` |
| `McpHelloWorld-ping-webhook` | Node.js webhook | `server.js` → `/mcp/ping` |
| `McpHelloWorld-greeting-context` (prompt) | Node.js webhook | `server.js` → `/mcp/prompt/greeting-context` |
| `McpHelloWorld-usage-guide` (prompt) | Node.js webhook | `server.js` → `/mcp/prompt/usage-guide` |
| `mcp-hello-world://status` (resource) | Node.js webhook | `server.js` → `/mcp/resource/status` |
| `mcp-hello-world://stats` (resource) | Node.js webhook | `server.js` → `/mcp/resource/stats` |

## Setup

```bash
# Start the webhook server (needed for the *-webhook tools and all prompts/resources)
node server.js

# Install the app (registers with the webhook server, then makes all tools available)
bin/console app:install --activate McpHelloWorld

# Verify
bin/console debug:mcp
```

If you only care about the app-script side, you still need to start `node server.js` once for the install handshake (`<setup>` in `manifest.xml`). After that the script tools work without the server running. To skip the server entirely, remove the `<setup>` block from `manifest.xml` and delete the webhook tools/prompts/resources from `Resources/mcp.xml`.

## How each pattern works

### Pattern A: Shopware app scripts

The `url` attribute in `mcp.xml` points to `/api/script/mcp-hello-world-*` — an internal Shopware route served by the matching Twig file in `Resources/scripts/`. `AppMcpToolExecutor` detects the `/`-prefixed URL and dispatches a Symfony subrequest. Arguments arrive as a POST form parameter named `arguments` and are accessible via `hook.request.request.all('arguments')`.

No external process, no network round-trip, full DAL access (subject to `<required-privileges>`).

### Pattern B: Node.js webhook

The `url` attribute is an absolute HTTP URL. `AppMcpToolExecutor` POSTs the call to that URL with HMAC headers signed by the app secret. The Node.js server in `server.js` shows the minimum required: a `/register` endpoint for the install handshake and the per-tool endpoints. Use this when the tool logic lives outside the shop (third-party service, separate language, etc.).

## Files

- `manifest.xml` — App metadata + `<setup>` block for the Node.js webhook registration
- `Resources/mcp.xml` — MCP definitions for both patterns
- `Resources/scripts/api-mcp-hello-world-*` — Shopware app scripts (Twig) for Pattern A
- `server.js` — Node.js webhook server for Pattern B
