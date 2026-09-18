#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllMcpTools } from "@orchestra/shared/node";

async function main() {
  const server = new McpServer({
    name: "Orchestra MCP",
    version: "1.0.0",
  });

  registerAllMcpTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Orchestra MCP] Server running on stdio transport");
}

main().catch((err) => {
  console.error("[Orchestra MCP] Fatal error:", err);
  process.exit(1);
});
