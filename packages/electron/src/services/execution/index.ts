import { parallelExecution, resolveDependencies } from "../graph.js";
import { workflowStore } from "../../store/index.js";
import { Task } from "@orchestra/shared";
import { runTask, clearTerminalService } from "./runner.js";

/**
 * Checks if all dependencies of a task are satisfied.
 */
function isTaskRunnable(task: Task): boolean {
  const currentTasks = workflowStore.getTasks();
  return task.dependency.every((depId) => {
    const dep = currentTasks.find((t) => t.id === depId);
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
  clearTerminalService();
  
  // Set all tasks state to idle before starting execution
  workflowStore.resetAllStates();
  
  if (wc && !wc.isDestroyed()) {
    workflowStore.getTasks().forEach((task) => {
      wc.send("task:state", { id: task.id, state: "idle" });
    });
  }

  const tasksList = workflowStore.getTasks();
  const dependenciesList = workflowStore.getDependencies();

  const dependencyCheck = resolveDependencies(dependenciesList, tasksList);
  if (!dependencyCheck.ok) {
    return { ok: false, error: "Cycle detected in dependencies" };
  }

  const parallelPlan = parallelExecution(dependenciesList, tasksList);
  if (!parallelPlan.ok || !parallelPlan.levels) {
    return { ok: false, error: "Invalid execution plan" };
  }

  // Execute tasks level by level
  for (const level of parallelPlan.levels) {
    const runnableTasks = level.filter(isTaskRunnable);

    if (runnableTasks.length === 0) continue;

    const results = await Promise.allSettled(
      runnableTasks.map((task) => {
        workflowStore.updateTaskState(task.id, "starting");
        return runTask(task, wc);
      }),
    );

    // Update tasks that failed to run
    results.forEach((result, index) => {
      const task = runnableTasks[index];
      if (result.status === "rejected") {
        const errorMsg = result.reason?.message || "Execution rejected";
        workflowStore.updateTaskState(task.id, "failed", errorMsg);
      }
    });
  }

  return {
    ok: true,
    order: dependencyCheck.order,
    levels: parallelPlan.levels.map((level) => level.map((t) => t.id)),
  };
}
