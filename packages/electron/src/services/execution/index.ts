import { workflowStore, setGlobalState } from "../../store/index.js";
import { runTask, workflowRunner } from "./runner.js";
import {
  buildAdjacencyList,
  buildIndegreeMap,
  buildTaskMap,
  resolveDependencies,
} from "../../utils/graph.js";
import { Task, Dependency } from "@orchestra/shared";

export class EventDrivenScheduler {
  private inDegrees: Map<string, number> = new Map();
  private adjacencyList: Map<string, string[]> = new Map();
  private tasksMap: Map<string, Task> = new Map();
  private activeExecutions: Set<string> = new Set();
  private completedTasks: Set<string> = new Set();

  private resolvePromise?: () => void;
  private rejectPromise?: (err: any) => void;
  private executionPromise?: Promise<void>;

  constructor() {
    this.adjacencyList = buildAdjacencyList(
      workflowStore.getDependencies(),
      workflowStore.getTasks(),
    );
    this.inDegrees = buildIndegreeMap(this.adjacencyList);
    this.tasksMap = buildTaskMap(workflowStore.getTasks());
  }

  // check tasks for the indegree 0
  // execute them
  async execute(wc: Electron.WebContents): Promise<void> {
    this.executionPromise = new Promise((res, rej) => {
      this.rejectPromise = rej;
      this.resolvePromise = res;
    });
    workflowStore.getTasks().forEach(async (task) => {
      if (this.inDegrees.get(task.id) === 0) {
        try {
          await this.run(task, wc);
        } catch (err) {
          this.rejectPromise?.(err);
        }
      }
    });
    if (this.activeExecutions.size === 0) {
      this.resolvePromise?.();
    }
    return this.executionPromise;
  }
  async run(task: Task, wc: Electron.WebContents) {
    try {
      this.activeExecutions.add(task.id);
      await runTask(task);
      this.handleSuccess(task, wc);
    } catch (err) {
      this.handleFailure(task, wc);
    }
  }
  handleSuccess(task: Task, wc: Electron.WebContents) {
    this.activeExecutions.delete(task.id);
    this.completedTasks.add(task.id);
    const nextTaskIds = this.adjacencyList.get(task.id) || [];

    const nextTasks: Task[] = [];
    nextTaskIds.forEach((id) => {
      const t = this.tasksMap.get(id);
      if (t) nextTasks.push(t);
    });
    const nextExecutableTask = nextTasks.filter((t) => this.checkDependency(t));
    nextExecutableTask.forEach((element) => {
      this.run(element, wc);
    });

    if (this.activeExecutions.size === 0) {
      this.resolvePromise?.();
    }
  }
  handleFailure(task: Task, wc: Electron.WebContents) {
    this.activeExecutions.delete(task.id);

    const children = this.adjacencyList.get(task.id) || [];
    for (const child of children) {
      const childTask = this.tasksMap.get(child);
      if (childTask) {
        this.propogateFailure(childTask);
      }
    }

    this.rejectPromise?.(new Error(`Task ${task.task} failed`));
  }
  propogateFailure(task: Task) {
    workflowRunner.getTerminalService().kill(task.id);
    const errorMessage = "Parent Task Failed";
    workflowStore.updateTaskState(task.id, "failed", errorMessage);
    const children = this.adjacencyList.get(task.id) || [];
    for (const child of children) {
      const childTask = this.tasksMap.get(child);
      if (childTask) {
        this.propogateFailure(childTask);
      }
    }
  }
  checkDependency(task: Task): boolean {
    return task.dependency.every((taskid) => this.completedTasks.has(taskid));
  }
}

/**
 * Executes the workflow by running tasks event-driven.
 */
export async function executeWorkflow(wc: Electron.WebContents) {
  const dependencyCheck = resolveDependencies(
    workflowStore.getDependencies(),
    workflowStore.getTasks(),
  );
  if (!dependencyCheck.ok) {
    return {
      ok: false,
      order: [],
    };
  }
  const scheduler = new EventDrivenScheduler();
  try {
    await scheduler.execute(wc);
    setGlobalState("completed");
  } catch (err) {
    setGlobalState("failed");
  }
  return {
    ok: true,
    order: dependencyCheck.order,
  };
}
