import test from "node:test";
import assert from "node:assert/strict";
import {
  parallelExecution,
  resolveDependencies,
  detectCycle,
} from "../packages/shared/dist/node.js";

test("DAG Engine Test Suite", async (t) => {
  await t.test("linear dependency ordering (DB -> Server -> Web)", () => {
    const tasks = [
      { id: "1", task: "Database", command: "docker run postgres", folder: "/", dependency: [], type: "job" as const, state: "idle" as const, logRules: [], retries: 0, timeout: 0, env: {}, onwatch: false },
      { id: "2", task: "BackendServer", command: "npm run start:api", folder: "/", dependency: ["1"], type: "service" as const, state: "idle" as const, logRules: [], retries: 0, timeout: 0, env: {}, onwatch: false },
      { id: "3", task: "WebFrontend", command: "npm run dev", folder: "/", dependency: ["2"], type: "service" as const, state: "idle" as const, logRules: [], retries: 0, timeout: 0, env: {}, onwatch: false },
    ];

    const dependencies = [
      { from: "1", to: "2" }, // DB -> Server
      { from: "2", to: "3" }, // Server -> Web
    ];

    const res = resolveDependencies(dependencies, tasks);

    assert.equal(res.ok, true, "Should resolve dependencies successfully");
    assert.deepEqual(res.order, ["Database", "BackendServer", "WebFrontend"]);
  });

  await t.test("parallel execution levels for independent tasks", () => {
    const tasks = [
      { id: "db", task: "PostgresDB", command: "docker run pg", folder: "/", dependency: [], type: "job" as const, state: "idle" as const, logRules: [], retries: 0, timeout: 0, env: {}, onwatch: false },
      { id: "redis", task: "RedisCache", command: "docker run redis", folder: "/", dependency: [], type: "job" as const, state: "idle" as const, logRules: [], retries: 0, timeout: 0, env: {}, onwatch: false },
      { id: "api", task: "APIServer", command: "npm start", folder: "/", dependency: ["db", "redis"], type: "service" as const, state: "idle" as const, logRules: [], retries: 0, timeout: 0, env: {}, onwatch: false },
    ];

    const dependencies = [
      { from: "db", to: "api" },
      { from: "redis", to: "api" },
    ];

    const res = parallelExecution(dependencies, tasks);

    assert.equal(res.ok, true);
    assert.ok(res.levels);
    assert.equal(res.levels.length, 2);

    const level0Tasks = res.levels[0].map((t) => t.task);
    assert.equal(level0Tasks.length, 2);
    assert.ok(level0Tasks.includes("PostgresDB"));
    assert.ok(level0Tasks.includes("RedisCache"));

    const level1Tasks = res.levels[1].map((t) => t.task);
    assert.deepEqual(level1Tasks, ["APIServer"]);
  });

  await t.test("cycle detection (A -> B -> A)", () => {
    const tasks = [
      { id: "a", task: "TaskA", command: "echo A", folder: "/", dependency: ["b"], type: "job" as const, state: "idle" as const, logRules: [], retries: 0, timeout: 0, env: {}, onwatch: false },
      { id: "b", task: "TaskB", command: "echo B", folder: "/", dependency: ["a"], type: "job" as const, state: "idle" as const, logRules: [], retries: 0, timeout: 0, env: {}, onwatch: false },
    ];

    const dependencies = [
      { from: "a", to: "b" },
      { from: "b", to: "a" },
    ];

    const cycle = detectCycle(dependencies, tasks);
    assert.ok(cycle.length > 0, "Cycle should be detected");
  });
});
