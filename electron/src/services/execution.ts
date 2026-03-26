import { parallelExecution, resolveDependencies } from "./graph.js";
import {
  tasks,
  dependencies,
  type Task,
  runningProcesses,
  SendEvent,
} from "../store/index.js";
import { runCommand } from "../lib/process.js";

function canRun(task: Task): boolean {
  const result = task.dependency.every((depId:string) => {
    const dep = tasks.find((t:Task) => t.id == depId);

    if (!dep) {
      return false;
    }

    if (dep.type === "job") {
      const ok = dep.state === "completed";
      return ok;
    }

    if (dep.type === "service") {
      const ok = dep.state === "ready";
      return ok;
    }

    return false;
  });

  return result;
}


export async function execute(send: SendEvent) {
  const { ok, order } = resolveDependencies(dependencies, tasks);

  if (!ok) {
    return { ok: false, error: "cycle detected" };
  }

  const parallels = parallelExecution(dependencies, tasks);

  if (!parallels.ok || !parallels.levels) {
    return { ok: false, error: "invalid execution plan" };
  }

  for (let i = 0; i < parallels.levels.length; i++) {
    const level = parallels.levels[i];
    const runnable: Task[] = level!.filter((task) => canRun(task));

    if (runnable.length === 0) {
      continue;
    }

    const results = await Promise.allSettled(
      runnable.map((task) => {
        task.state = "starting";
        return runCommand(task, send);
      }),
    );

    results.forEach((result, index) => {
      const task = runnable[index];

      if (result.status === "rejected") {
        task!.state = "failed";
      }
    });
  }

  return {
    ok: true,
    order,
    levels: parallels.levels.map((level) => level.map((t) => t.id)),
  };
}

export const stopExecution = () => {
  for (const [taskId, child] of runningProcesses) {
    if (!child.pid) {
      continue;
    }

    try {
      process.kill(-child.pid, "SIGTERM");
    } catch (err) {
      continue;
    }

    setTimeout(() => {
      try {
        process.kill(-child.pid!, 0);
        process.kill(-child.pid!, "SIGKILL");
      } catch {}
    }, 3000);
  }

  runningProcesses.clear();
  return true;
};

export const stopProcess = (id: string) => {
  const child = runningProcesses.get(id);

  if (!child || !child.pid) {
    return false;
  }

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch (err) {
    return false;
  }

  setTimeout(() => {
    try {
      process.kill(-child.pid!, 0);
      process.kill(-child.pid!, "SIGKILL");
    } catch {}
  }, 3000);

  return true;
};