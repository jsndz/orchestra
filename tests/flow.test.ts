import test from "node:test";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
// @ts-expect-error - JS build artifact without bundled type declarations
import { workflowStore } from "../packages/electron/dist/store/index.js";
// @ts-expect-error - JS build artifact without bundled type declarations
import { executeWorkflow } from "../packages/electron/dist/services/execution/index.js";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("Whole flow of creating and running a simple job", async (t:any) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "orchestra-flow-"));

  try {
    // 1. Reset store and ensure it's empty
    workflowStore.setWorkflow([], []);

    // 2. Create a simple task
    const task = workflowStore.createTask({
      task: "HelloTestJob",
      command: "echo 'HELLO_INTEGRATION_TEST'",
      folder: tempDir,
      type: "job",
      onwatch: false,
    });

    assert.strictEqual(task.state, "idle", "Task should initially be idle");

    // 3. Execute the workflow using the scheduler
    // We pass null as WebContents since it is not used in the execution logic
    const result = await executeWorkflow(null as any);

    assert.strictEqual(result.ok, true, "Workflow execution should succeed");
    assert.deepStrictEqual(result.order, [task.task], "Execution order should contain our task");

    // 4. Wait a brief moment for the shell command to run and exit
    let attempts = 0;
    while (task.state !== "completed" && attempts < 15) {
      await delay(200);
      attempts++;
    }

    assert.strictEqual(task.state, "completed", "Task state should be completed after execution");

    // 5. Read the log file written by TaskLogger
    const logFilePath = path.join(tempDir, ".orchestra-logs", "HelloTestJob.log");
    const logContent = await fs.readFile(logFilePath, "utf8");

    assert.match(logContent, /HELLO_INTEGRATION_TEST/, "Log file should contain command output");

  } finally {
    // Cleanup temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
