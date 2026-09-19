import test from "node:test";
import assert from "node:assert/strict";
import {
  workflowToDag,
  dagToWorkflow,
  dagToYaml,
  yamlToDag,
  workflowStore,
} from "../packages/shared/dist/node.js";

test("YAML Export and Import Round-Trip Test Suite", async (t) => {
  await t.test("exporting tasks and deps to YAML and parsing back losslessly", () => {
    const originalTasks = [
      {
        id: "postgres",
        task: "PostgresContainer",
        command: "docker run -p 5432:5432 postgres:16",
        folder: "/app",
        dependency: [],
        type: "job" as const,
        state: "idle" as const,
        timeout: 30,
        retries: 3,
        env: { POSTGRES_DB: "testdb" },
        ready: { kind: "port" as const, port: 5432 },
        logRules: [],
        onwatch: false,
      },
      {
        id: "nodeserver",
        task: "NodeServer",
        command: "npm run dev",
        folder: "/app/server",
        dependency: ["postgres"],
        type: "service" as const,
        state: "idle" as const,
        timeout: 60,
        retries: 1,
        env: { PORT: "3000" },
        ready: { kind: "http" as const, url: "http://localhost:3000/health" },
        logRules: [],
        onwatch: true,
      },
    ];

    const originalDeps = [
      { from: "postgres", to: "nodeserver" },
    ];

    // 1. Convert to DAG format and serialize to YAML
    const dag = workflowToDag(originalTasks, originalDeps, "Test Workflow", 1);
    const yamlString = dagToYaml(dag);

    assert.ok(typeof yamlString === "string");
    assert.ok(yamlString.includes("postgrescontainer"));
    assert.ok(yamlString.includes("nodeserver"));

    // 2. Deserialize YAML back to DAG and back to Workflow
    const parsedDag = yamlToDag(yamlString);
    const { tasks: importedTasks, dependencies: importedDeps } = dagToWorkflow(parsedDag);

    assert.equal(importedTasks.length, 2);
    assert.equal(importedDeps.length, 1);

    const postgresTask = importedTasks.find((t) => t.id === "postgrescontainer");
    assert.ok(postgresTask);
    assert.equal(postgresTask.command, "docker run -p 5432:5432 postgres:16");
    assert.equal(postgresTask.type, "job");
    assert.equal(postgresTask.ready?.kind, "port");
    assert.equal(postgresTask.ready?.port, 5432);

    const nodeServerTask = importedTasks.find((t) => t.id === "nodeserver");
    assert.ok(nodeServerTask);
    assert.equal(nodeServerTask.ready?.kind, "http");
    assert.equal(nodeServerTask.ready?.url, "http://localhost:3000/health");

    assert.equal(importedDeps[0].from, "postgrescontainer");
    assert.equal(importedDeps[0].to, "nodeserver");
  });

  await t.test("importing YAML into workflowStore", () => {
    workflowStore.setWorkflow([], []);

    const yamlSpec = `
version: 1
name: SampleWorkflow
tasks:
  buildstep:
    folder: /project
    command: npm run build
    type: job
    ready:
      kind: exit
  servestep:
    folder: /project
    command: npm start
    type: service
    dependsOn:
      - buildstep
    ready:
      kind: log
      match: "Server listening"
`;

    const parsedDag = yamlToDag(yamlSpec);
    const { tasks, dependencies } = dagToWorkflow(parsedDag);
    workflowStore.setWorkflow(tasks, dependencies);

    const currentTasks = workflowStore.getTasks();
    const currentDeps = workflowStore.getDependencies();

    assert.equal(currentTasks.length, 2);
    assert.equal(currentDeps.length, 1);

    const build = currentTasks.find((t) => t.id === "buildstep");
    const serve = currentTasks.find((t) => t.id === "servestep");

    assert.equal(build?.command, "npm run build");
    assert.equal(serve?.ready?.kind, "log");
    assert.equal(serve?.ready?.match, "Server listening");
  });
});
