import test from "node:test";
import assert from "node:assert/strict";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllMcpTools, workflowStore } from "../packages/shared/dist/node.js";

test("MCP Tools Registration and Execution Test", async (t) => {
  const mcp = new McpServer({
    name: "Orchestra Test MCP",
    version: "1.0.0",
  });

  registerAllMcpTools(mcp);

  await t.test("Workflow task CRUD via workflowStore", () => {
    workflowStore.setWorkflow([], []);

    const t1 = workflowStore.createTask({
      task: "TestTask1",
      command: "echo hello",
      folder: "/tmp",
      type: "job",
      timeout: 10,
      retries: 2,
      env: { FOO: "bar" },
      ready: { kind: "exit" },
      onwatch: false,
    });

    assert.equal(t1.task, "TestTask1");
    assert.equal(workflowStore.getTasks().length, 1);

    const updated = workflowStore.updateTask(t1.id, {
      command: "echo world",
      ready: { kind: "port", port: 8080 },
    });

    assert.equal(updated.command, "echo world");
    assert.equal(updated.ready?.kind, "port");

    workflowStore.deleteTask(t1.id);
    assert.equal(workflowStore.getTasks().length, 0);
  });
});
