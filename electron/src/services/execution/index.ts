import { parallelExecution, resolveDependencies } from "../graph.js";
import { tasks, dependencies } from "../../store/index.js";
import { Task } from "../../types/index.js";
import { runTask } from "./runner.js";

/**
 * Checks if all dependencies of a task are satisfied.
 */
function isTaskRunnable(task: Task): boolean {
  return task.dependency.every((depId) => {
    const dep = tasks.find((t) => t.id === depId);
    if (!dep) return false;

    return (
      (dep.type === "job" && dep.state === "completed") ||
      (dep.type === "service" && dep.state === "ready")
    );
  });
}

/**
 * Executes the workflow by running tasks in parallel levels.
 */
export async function executeWorkflow(wc: Electron.WebContents) {
  const dependencyCheck = resolveDependencies(dependencies, tasks);
  if (!dependencyCheck.ok) {
    return { ok: false, error: "Cycle detected in dependencies" };
  }

  const parallelPlan = parallelExecution(dependencies, tasks);
  if (!parallelPlan.ok || !parallelPlan.levels) {
    return { ok: false, error: "Invalid execution plan" };
  }

  // Execute tasks level by level
  for (const level of parallelPlan.levels) {
    const runnableTasks = level.filter(isTaskRunnable);

    if (runnableTasks.length === 0) continue;

    const results = await Promise.allSettled(
      runnableTasks.map((task) => {
        task.state = "starting";
        return runTask(task, wc);
      }),
    );

    // Check for failures in the current level
    
    results.forEach((result, index) => {
      const task = runnableTasks[index];

      if (result.status === "rejected") {
        task!.state = "failed";
      }
    });
  }

  return {
    ok: true,
    order: dependencyCheck.order,
    levels: parallelPlan.levels.map((level) => level.map((t) => t.id)),
  };
}
