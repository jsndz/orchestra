import { type Dependency, type Task } from "../store/index.js";
import { parse, stringify } from "yaml";

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
    kind: "exit" | "port" | "log";
    port?: number;
    match?: string;
    isRegex?: boolean;
  };
  dependsOn?: string[];
  logRules?: DagLogRule[];
}

type Dag = {
  version: number;
  name: string;
  tasks: Record<string, DagTask>;
};

function normalizeId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".");
}

function serializeReady(ready?: Task["ready"]): DagTask["ready"] {
  if (!ready) return undefined;

  if (ready.kind === "port") {
    return { kind: "port", port: ready.port };
  }

  if (ready.kind === "log") {
    return {
      kind: "log",
      match: typeof ready.match === "string" ? ready.match : ready.match.source,
      isRegex: ready.isRegex,
    };
  }

  return { kind: "exit" };
}

function deserializeReady(ready?: DagTask["ready"]): Task["ready"] {
  if (!ready) return undefined;

  if (ready.kind === "port") {
    return { kind: "port", port: ready.port! };
  }

  if (ready.kind === "log") {
    return { kind: "log", match: ready.match! ,isRegex: ready.isRegex!};
  }

  return { kind: "exit" };
}

function serializeLogRules(rules?: Task["logRules"]): DagLogRule[] | undefined {
  if (!rules) return undefined;
  return rules.map((r) => ({
    id: r.id,
    label: r.label,
    match: typeof r.match === "string" ? r.match : r.match.source,
    color: r.color,
    enabled: r.enabled,
    isRegex: r.match instanceof RegExp,
  }));
}

function deserializeLogRules(rules?: DagLogRule[]): Task["logRules"] | undefined {
  if (!rules) return undefined;
  return rules.map((r) => ({
    id: r.id,
    label: r.label,
    match: r.isRegex ? new RegExp(r.match) : r.match,
    isRegex: !!r.isRegex,
    color: r.color,
    enabled: r.enabled,
  }));
}

export function WorkFlowToDAG(
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
    };
  }

  for (const d of deps) {
    const fromTask = tasks.find((t) => t.id === d.from)!;
    const toTask = tasks.find((t) => t.id === d.to)!;

    const from = normalizeId(fromTask.task);
    const to = normalizeId(toTask.task);

    taskRecord[to]!.dependsOn!.push(from);
  }

  return {
    version,
    name: workflowName,
    tasks: taskRecord,
  };
}

export function dagToWorkflow(dag: Dag) {
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
    });
  }

  for (const [to, t] of Object.entries(dag.tasks)) {
    for (const from of t.dependsOn ?? []) {
      dependencies.push({ from, to });

      const task = tasks.find((x) => x.id === to)!;
      task.dependency.push(from);
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
