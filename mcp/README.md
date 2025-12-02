# Product Flow MCP Server

An MCP (Model Context Protocol) server that exposes Product Flow's GraphQL API as tools for AI assistants like Claude Code.

## Setup

1. Install dependencies:
   ```bash
   cd mcp
   npm install
   ```

2. Build the server:
   ```bash
   npm run build
   ```

3. Configure environment variables (copy `.env.example` to `.env` and fill in values):
   ```bash
   cp .env.example .env
   ```

## Usage with Claude Code

The server is pre-configured in `.claude/mcp.json`. After restarting Claude Code, the tools will be available.

## Available Tools

### get_idea
Get an idea by its number within a portfolio and product.

**Arguments:**
- `portfolioCode` (required): The portfolio code
- `productCode` (required): The product code
- `ideaNumber` (required): The idea number

**Example:** "Get idea 1 from portfolio test and product test-web-app"

### list_ideas
List ideas for a product with optional filtering.

**Arguments:**
- `portfolioCode` (required): The portfolio code
- `productCode` (required): The product code
- `validationStatus` (optional): Filter by status ("firstLevel", "secondLevel", "scaling")

**Example:** "List all scaling ideas in test/test-web-app"

### list_portfolios
List all portfolios with their products.

**Arguments:** None

**Example:** "List all portfolios"

### get_kb_document
Get a knowledge base document by its ID.

**Arguments:**
- `id` (required): The document ID

### list_kb_documents
List knowledge base documents for a product.

**Arguments:**
- `portfolioCode` (required): The portfolio code
- `productCode` (required): The product code

## Testing

Test tool listing:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
  GRAPHQL_URL="..." GRAPHQL_API_KEY="..." \
  node dist/server.js
```

Test getting an idea:
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_idea","arguments":{"portfolioCode":"test","productCode":"test-web-app","ideaNumber":1}}}' | \
  GRAPHQL_URL="..." GRAPHQL_API_KEY="..." \
  node dist/server.js
```

## Development

The server is written in TypeScript. Source files are in `src/`, compiled output in `dist/`.

To rebuild after changes:
```bash
npm run build
```
