import { Task, Dependency } from "../index.js";
import { parse } from "yaml";

export function autoImportPackageJson(
  content: string,
  folder: string = "/"
): { tasks: Task[]; dependencies: Dependency[] } {
  const json = JSON.parse(content);
  const scripts = json.scripts || {};
  const tasks: Task[] = [];
  const dependencies: Dependency[] = [];

  const scriptKeys = Object.keys(scripts);
  for (const script of scriptKeys) {
    const isService = script === "dev" || script === "start" || script === "serve";
    tasks.push({
      id: script,
      task: script,
      command: `npm run ${script}`,
      folder,
      dependency: [],
      type: isService ? "service" : "job",
      state: "idle",
      ready: isService ? { kind: "exit" } : { kind: "exit" },
      logRules: [],
      retries: 0,
      timeout: 0,
      env: {},
      onwatch: false,
    });
  }

  // Common script dependencies: build -> start / dev
  if (scripts.build && scripts.start) {
    dependencies.push({ from: "build", to: "start" });
    const startTask = tasks.find((t) => t.id === "start");
    startTask?.dependency.push("build");
  }

  return { tasks, dependencies };
}

export function autoImportProcfile(
  content: string,
  folder: string = "/"
): { tasks: Task[]; dependencies: Dependency[] } {
  const tasks: Task[] = [];
  const dependencies: Dependency[] = [];

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const name = trimmed.substring(0, colonIdx).trim();
    const command = trimmed.substring(colonIdx + 1).trim();

    tasks.push({
      id: name,
      task: name,
      command,
      folder,
      dependency: [],
      type: name === "web" ? "service" : "job",
      state: "idle",
      ready: { kind: "exit" },
      logRules: [],
      retries: 0,
      timeout: 0,
      env: {},
      onwatch: false,
    });
  }

  return { tasks, dependencies };
}

export function autoImportDockerCompose(
  content: string,
  folder: string = "/"
): { tasks: Task[]; dependencies: Dependency[] } {
  const parsed = parse(content);
  const services = parsed?.services || {};
  const tasks: Task[] = [];
  const dependencies: Dependency[] = [];

  for (const [name, service] of Object.entries<any>(services)) {
    tasks.push({
      id: name,
      task: name,
      command: `docker compose run --rm ${name}`,
      folder,
      dependency: [],
      type: "service",
      state: "idle",
      ready: { kind: "exit" },
      logRules: [],
      retries: 0,
      timeout: 0,
      env: service.environment || {},
      onwatch: false,
    });
  }

  for (const [name, service] of Object.entries<any>(services)) {
    const dependsOn = service?.depends_on;
    if (Array.isArray(dependsOn)) {
      for (const dep of dependsOn) {
        dependencies.push({ from: dep, to: name });
        const task = tasks.find((t) => t.id === name);
        task?.dependency.push(dep);
      }
    } else if (dependsOn && typeof dependsOn === "object") {
      for (const dep of Object.keys(dependsOn)) {
        dependencies.push({ from: dep, to: name });
        const task = tasks.find((t) => t.id === name);
        task?.dependency.push(dep);
      }
    }
  }

  return { tasks, dependencies };
}
