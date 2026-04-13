import { parallelExecution, resolveDependencies } from "./graph.js";
import { tasks, dependencies, type Task } from "../store/index.js";
import { runCommand } from "../lib/process.js";

// only if all the dependencies are satisfied, we can run the task
function canRun(task: Task): boolean {
  const result = task.dependency.every((depId: string) => {
    const dep = tasks.find((t: Task) => t.id == depId);

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

export async function execute(wc: Electron.WebContents) {
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
        return runCommand(task, wc);
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
