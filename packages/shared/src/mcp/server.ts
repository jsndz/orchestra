import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import { registerAllMcpTools } from "./tools/index.js";

export function createMCPserver(port = 3030, token?: string) {
  const app = express();
  app.use(express.json());

  // Authentication Middleware for HTTP endpoints
  if (token) {
    app.use((req, res, next) => {
      const authHeader = req.headers.authorization;
      const customHeader = req.headers["x-mcp-token"];
      const queryToken = req.query.token;

      let requestToken: string | undefined;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        requestToken = authHeader.substring(7).trim();
      } else if (typeof customHeader === "string") {
        requestToken = customHeader.trim();
      } else if (typeof queryToken === "string") {
        requestToken = queryToken.trim();
      }

      if (!requestToken || requestToken !== token) {
        res.status(401).json({
          error: "Unauthorized: Invalid or missing authentication token",
        });
        return;
      }
      next();
    });
  }

  function createMcpInstance() {
    const mcp = new McpServer({
      name: "Orchestra MCP",
      version: "1.0.0",
    });
    registerAllMcpTools(mcp);
    return mcp;
  }

  const transports = new Map<string, StreamableHTTPServerTransport>();

  app.post("/mcp", async (req, res) => {
    try {
      const sessionId = req.header("mcp-session-id");
      let transport: StreamableHTTPServerTransport;

      if (sessionId) {
        transport = transports.get(sessionId)!;
        if (!transport) {
          res.status(404).send("Unknown session");
          return;
        }
      } else {
        if (!isInitializeRequest(req.body)) {
          res.status(400).send("Initialize first");
          return;
        }
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized(id) {
            transports.set(id, transport);
          },
          onsessionclosed(id) {
            transports.delete(id);
          },
        });
        const mcp = createMcpInstance();
        await mcp.connect(transport);
      }
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP Request Error:", error);

      if (!res.headersSent) {
        res.status(500).json({
          error: "Internal Server Error",
        });
      }
    }
  });

  app.get("/mcp", async (req, res) => {
    const sessionId = req.header("mcp-session-id");
    if (!sessionId) {
      res.status(404).send("Unknown session");
      return;
    }

    const transport = transports.get(sessionId);

    if (!transport) {
      res.status(404).send("Unknown session");
      return;
    }

    transport.handleRequest(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    const sessionId = req.header("mcp-session-id");

    if (!sessionId) {
      res.status(400).send("Missing session id");
      return;
    }

    const transport = transports.get(sessionId);

    if (!transport) {
      res.status(404).send("Unknown session");
      return;
    }

    await transport.handleRequest(req, res);
  });

  let httpserver: ReturnType<typeof app.listen>;
  return {
    start(host = "127.0.0.1") {
      httpserver = app.listen(port, host, () => {
        console.log(`MCP server running on ${host}:${port}`);
      });
    },
    stop() {
      httpserver?.close();
    },
  };
}
