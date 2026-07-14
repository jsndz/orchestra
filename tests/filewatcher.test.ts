import test from "node:test";
import assert from "node:assert";
import fs from "node:fs/promises";
import { join } from "node:path";
import os from "node:os";
import { FileWatcher } from "../packages/electron/dist/services/filewatcher.js";
import { workflowRunner } from "../packages/electron/dist/services/execution/runner.js";
import type { Task } from "@orchestra/shared";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("FileWatcher ignores specified folders and triggers on allowed files", async (t) => {
  const tempDir = await fs.mkdtemp(join(os.tmpdir(), "orchestra-test-"));

  try {
    // Pre-create all directories and files so they exist before watcher starts
    const normalFile = join(tempDir, "test.txt");
    await fs.writeFile(normalFile, "initial content");

    const nodeModulesDir = join(tempDir, "node_modules", "package");
    await fs.mkdir(nodeModulesDir, { recursive: true });
    const ignoredFile = join(nodeModulesDir, "index.js");
    await fs.writeFile(ignoredFile, "console.log('initial');");

    const gitDir = join(tempDir, ".git");
    await fs.mkdir(gitDir, { recursive: true });
    const gitFile = join(gitDir, "HEAD");
    await fs.writeFile(gitFile, "ref: refs/heads/main");

    const distDir = join(tempDir, "dist");
    await fs.mkdir(distDir, { recursive: true });
    const distFile = join(distDir, "main.js");
    await fs.writeFile(distFile, "console.log('initial');");

    let changeCount = 0;
    const watcher = new FileWatcher(tempDir, () => {
      changeCount++;
    });

    watcher.start();

    // Wait for chokidar watcher to be fully ready
    await new Promise<void>((resolve) => {
      (watcher as any).watcher.on("ready", resolve);
    });

    // 1. Test normal file change triggers onchange
    await fs.writeFile(normalFile, "updated content");
    await delay(300);
    assert.strictEqual(changeCount, 1, "Modifying a normal file should trigger onchange");

    // 2. Test nested node_modules file change does NOT trigger onchange
    await fs.writeFile(ignoredFile, "console.log('hello');");
    await delay(300);
    assert.strictEqual(changeCount, 1, "Modifying a file inside node_modules should not trigger onchange");

    // 3. Test nested .git file change does NOT trigger onchange
    await fs.writeFile(gitFile, "ref: refs/heads/feature");
    await delay(300);
    assert.strictEqual(changeCount, 1, "Modifying a file inside .git should not trigger onchange");

    // 4. Test nested dist file change does NOT trigger onchange
    await fs.writeFile(distFile, "console.log('build');");
    await delay(300);
    assert.strictEqual(changeCount, 1, "Modifying a file inside dist should not trigger onchange");

    // 5. Test normal file modification again
    await fs.writeFile(normalFile, "subsequent content");
    await delay(300);
    assert.strictEqual(changeCount, 2, "Subsequent normal file changes should trigger onchange");

    // 6. Test close() stops watcher from triggering
    await watcher.close();
    await fs.writeFile(normalFile, "content after close");
    await delay(300);
    assert.strictEqual(changeCount, 2, "No changes should trigger after watcher is closed");

  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("WorkflowRunner activeWatcher lifecycle tracking", async (t) => {
  const tempDir = await fs.mkdtemp(join(os.tmpdir(), "runner-watch-test-"));

  try {
    const task: Task = {
      id: "test-task-id",
      task: "Test Task",
      command: "echo test",
      folder: tempDir,
      dependency: [],
      type: "job",
      state: "idle",
      onwatch: true,
    };

    const runnerWatchers = (workflowRunner as any).activeWatchers;

    // 1. Verify initially no watcher exists for the test task
    assert.strictEqual(runnerWatchers.has(task.id), false, "Watcher should not exist initially");

    // 2. Start watching
    await workflowRunner.watchTask(task, "mock-terminal-id");
    assert.strictEqual(runnerWatchers.has(task.id), true, "Watcher should be registered after watchTask");

    // 3. Call stopTask and verify it cleans up the watcher
    await workflowRunner.stopTask(task.id);
    assert.strictEqual(runnerWatchers.has(task.id), false, "Watcher should be removed after stopTask");

    // 4. Restart watching and verify clearTerminalService cleans it up
    await workflowRunner.watchTask(task, "mock-terminal-id");
    assert.strictEqual(runnerWatchers.has(task.id), true, "Watcher should be registered again");

    await workflowRunner.clearTerminalService();
    assert.strictEqual(runnerWatchers.has(task.id), false, "Watcher should be cleaned up by clearTerminalService");

  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("TerminalService recreation on existing terminal ID", async (t) => {
  const tempDir = await fs.mkdtemp(join(os.tmpdir(), "term-recreate-test-"));

  try {
    const task: Task = {
      id: "term-recreate-task",
      task: "Recreate Task",
      command: "echo first_run",
      folder: tempDir,
      dependency: [],
      type: "job",
      state: "idle",
      onwatch: false,
    };

    const terminalService = workflowRunner.getTerminalService();

    let output1 = "";
    // Create first terminal process
    const termId = await terminalService.create(
      tempDir,
      task,
      () => {},
      (id, data) => {
        output1 += data;
      },
      () => {}
    );

    // Wait for the first run to output data
    await delay(500);
    assert.match(output1, /first_run/, "First run should output first_run");

    // Modify task command to simulate hot-reload changes
    task.command = "echo second_run";

    let output2 = "";
    // Recreate terminal process on the same termId
    await terminalService.create(
      tempDir,
      task,
      () => {},
      (id, data) => {
        output2 += data;
      },
      () => {},
      termId
    );

    // Wait for the second run to output data
    await delay(500);
    assert.match(output2, /second_run/, "Second run should output second_run");

    // Clean up
    await terminalService.kill(termId);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
