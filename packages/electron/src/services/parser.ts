import { parse, stringify } from "yaml";
import { Dependency, Task } from "../types/index.js";

interface DagLogRule {
  id: string;
  label: string;
  match: string;
  color?: string;
  enabled: boolean;
  isRegex?: boolean;
}

interface DagTask {
  folder: string;
  command: string;
  type: "job" | "service";
  ready?: {
    kind: "exit" | "port" | "log" | "http";
    port?: number;
    match?: string;
    isRegex?: boolean;
    url?: string;
    code?: number;
  };
  dependsOn?: string[];
  logRules?: DagLogRule[];
  x?: number;
  y?: number;
  retries?: number;
  timeout?: number;
  env?: Record<string, string>;
}

type Dag = {
  version: number;
  name: string;
  tasks: Record<string, DagTask>;
};

function normalizeId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".");
}

function serializeReady(ready?: Task["ready"]): DagTask["ready"] {
  if (!ready) return undefined;

  switch (ready.kind) {
    case "port":
      return { kind: "port", port: ready.port };
    case "log":
      return {
        kind: "log",
        match: typeof ready.match === "string" ? ready.match : ready.match.source,
        isRegex: ready.isRegex,
      };
    case "http":
      return { kind: "http", url: ready.url, code: ready.code };
    default:
      return { kind: "exit" };
  }
}

function deserializeReady(ready?: DagTask["ready"]): Task["ready"] {
  if (!ready) return undefined;

  switch (ready.kind) {
    case "port":
      return { kind: "port", port: ready.port ?? 0 };
    case "log":
      return {
        kind: "log",
        match: ready.match ?? "",
        isRegex: !!ready.isRegex,
      };
    case "http":
      return { kind: "http", url: ready.url ?? "", code: ready.code };
    default:
      return { kind: "exit" };
  }
}

function serializeLogRules(rules?: Task["logRules"]): DagLogRule[] | undefined {
  return rules?.map((r) => ({
    id: r.id,
    label: r.label,
    match: typeof r.match === "string" ? r.match : r.match.source,
    color: r.color,
    enabled: r.enabled,
    isRegex: r.isRegex || r.match instanceof RegExp,
  }));
}

function deserializeLogRules(rules?: DagLogRule[]): Task["logRules"] | undefined {
  return rules?.map((r) => ({
    id: r.id,
    label: r.label,
    match: r.isRegex ? new RegExp(r.match) : r.match,
    isRegex: !!r.isRegex,
    color: r.color,
    enabled: r.enabled,
  }));
}

export function workflowToDag(
  tasks: Task[],
  deps: Dependency[],
  workflowName: string,
  version: number,
): Dag {
  const taskRecord: Record<string, DagTask> = {};

  for (const t of tasks) {
    const id = normalizeId(t.task);
    taskRecord[id] = {
      folder: t.folder,
      command: t.command,
      type: t.type,
      ready: serializeReady(t.ready),
      dependsOn: [],
      logRules: serializeLogRules(t.logRules),
      x: t.x,
      y: t.y,
      retries: t.retries,
      timeout: t.timeout,
      env: t.env,
    };
  }

  for (const d of deps) {
    const fromTask = tasks.find((t) => t.id === d.from);
    const toTask = tasks.find((t) => t.id === d.to);

    if (fromTask && toTask) {
      const from = normalizeId(fromTask.task);
      const to = normalizeId(toTask.task);
      taskRecord[to]?.dependsOn?.push(from);
    }
  }

  return { version, name: workflowName, tasks: taskRecord };
}

export function dagToWorkflow(dag: Dag): { tasks: Task[]; dependencies: Dependency[] } {
  const tasks: Task[] = [];
  const dependencies: Dependency[] = [];

  for (const [id, t] of Object.entries(dag.tasks)) {
    tasks.push({
      id,
      task: id,
      folder: t.folder,
      command: t.command,
      dependency: [],
      type: t.type,
      ready: deserializeReady(t.ready),
      state: "idle",
      logRules: deserializeLogRules(t.logRules),
      x: t.x,
      y: t.y,
      retries: t.retries ?? 0,
      timeout: t.timeout ?? 0,
      env: t.env ?? {},
    });
  }

  for (const [to, t] of Object.entries(dag.tasks)) {
    for (const from of t.dependsOn ?? []) {
      dependencies.push({ from, to });
      const task = tasks.find((x) => x.id === to);
      task?.dependency.push(from);
    }
  }

  return { tasks, dependencies };
}

export function dagToYaml(dag: Dag): string {
  return stringify(dag);
}

export function yamlToDag(yaml: string): Dag {
  return parse(yaml);
}
