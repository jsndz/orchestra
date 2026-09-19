import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createMCPserver } from "../packages/shared/dist/node.js";

function makeRequest(
  url: string,
  options: http.RequestOptions,
  body?: string
): Promise<{ statusCode?: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

test("Local MCP HTTP Server Lifecycle & Auth Suite", async (t) => {
  const PORT = 3999;
  const AUTH_TOKEN = "test-secret-auth-token-12345";
  let serverHandle: ReturnType<typeof createMCPserver> | null = null;

  await t.test("start local HTTP MCP server on 127.0.0.1:3999 with auth token", async () => {
    serverHandle = createMCPserver(PORT, AUTH_TOKEN);
    serverHandle.start("127.0.0.1");
    // Brief delay to allow server socket to bind
    await new Promise((r) => setTimeout(r, 100));
  });

  await t.test("POST /mcp request without token yields 401 Unauthorized", async () => {
    const response = await makeRequest(`http://127.0.0.1:${PORT}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }, JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }));

    assert.equal(response.statusCode, 401);
    const json = JSON.parse(response.body);
    assert.equal(json.error, "Unauthorized: Invalid or missing authentication token");
  });

  await t.test("POST /mcp request with invalid token yields 401 Unauthorized", async () => {
    const response = await makeRequest(`http://127.0.0.1:${PORT}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer wrong-invalid-token",
      },
    }, JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }));

    assert.equal(response.statusCode, 401);
    const json = JSON.parse(response.body);
    assert.equal(json.error, "Unauthorized: Invalid or missing authentication token");
  });

  await t.test("POST /mcp request with valid Bearer token passes auth layer", async () => {
    const response = await makeRequest(`http://127.0.0.1:${PORT}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AUTH_TOKEN}`,
      },
    }, JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    }));

    // Authentication passed (not 401 or 403)
    assert.notEqual(response.statusCode, 401);
    assert.notEqual(response.statusCode, 403);
  });

  await t.test("close local HTTP MCP server cleanly", async () => {
    if (serverHandle) {
      serverHandle.stop();
    }
  });
});
