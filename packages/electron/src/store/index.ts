import {
  Task,
  Dependency,
  GlobalExecutionState,
  TaskState,
} from "@orchestra/shared";
import crypto from "crypto";

export class WorkflowStore {
  private tasks: Task[] = [];
  private dependencies: Dependency[] = [];
  private globalState: GlobalExecutionState = "idle";

  /**
   * Retrieves the current list of tasks.
   */
  public getTasks(): Task[] {
    return this.tasks;
  }

  /**
   * Retrieves the current list of task dependencies.
   */
  public getDependencies(): Dependency[] {
    return this.dependencies;
  }

  /**
   * Retrieves the global workflow execution state.
   */
  public getGlobalState(): GlobalExecutionState {
    return this.globalState;
  }

  /**
   * Updates the global execution state.
   */
  public setGlobalState(state: GlobalExecutionState) {
    this.globalState = state;
  }

  /**
   * Returns a snapshot of the full workflow (tasks and dependencies).
   */
  public getWorkflow() {
    return {
      tasks: this.tasks,
      dependencies: this.dependencies,
    };
  }

  /**
   * Replaces the active workflow tasks and dependencies.
   */
  public setWorkflow(newTasks: Task[], newDeps: Dependency[]) {
    this.tasks.length = 0;
    this.dependencies.length = 0;
    this.tasks.push(...newTasks);
    this.dependencies.push(...newDeps);
  }

  /**
   * Creates a new task and registers it in the state.
   */
  public createTask(body: Partial<Task>): Task {
    if (!body.task || !body.command || !body.folder || !body.type) {
      throw new Error("Missing required fields");
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      task: body.task,
      command: body.command,
      folder: body.folder,
      dependency: [],
      type: body.type,
      state: "idle",
      ready: body.ready || { kind: "exit" },
      logRules: body.logRules || [],
      x: body.x,
      y: body.y,
      retries: body.retries ?? 0,
      timeout: body.timeout ?? 0,
      env: body.env ?? {},
      onwatch: body.onwatch ?? false,
    };

    this.tasks.push(newTask);
    return newTask;
  }

  /**
   * Updates an existing task's properties.
   */
  public updateTask(id: string, data: Partial<Task>): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error("Task not found");

    const cleanData = { ...data };
    delete (cleanData as any).id;

    Object.assign(task, cleanData);

    if (task.retries === undefined || task.retries === null) {
      task.retries = 0;
    }
    if (task.timeout === undefined || task.timeout === null) {
      task.timeout = 0;
    }
    if (task.env === undefined || task.env === null) {
      task.env = {};
    }

    return task;
  }

  /**
   * Safe method to update a task's state and optional execution failure details.
   */
  public updateTaskState(id: string, state: TaskState, failureReason?: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.state = state;
      if (failureReason !== undefined) {
        task.failureReason = failureReason;
      } else if (
        ["idle", "starting", "running", "ready", "completed"].includes(state)
      ) {
        delete task.failureReason;
      }
    }
  }

  /**
   * Deletes a task by ID and removes any associated dependency links.
   */
  public deleteTask(id: string) {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.tasks.splice(idx, 1);
    }

    this.dependencies = this.dependencies.filter(
      (dep) => dep.from !== id && dep.to !== id,
    );

    this.tasks.forEach((task) => {
      task.dependency = task.dependency.filter((depId) => depId !== id);
    });
  }

  /**
   * Adds a directional dependency from one task to another.
   */
  public addDependency(from: string, to: string) {
    if (!from || !to) throw new Error("Invalid dependency");

    const exists = this.dependencies.some(
      (d) => d.from === from && d.to === to,
    );
    if (!exists) {
      this.dependencies.push({ from, to });
    }

    const targetTask = this.tasks.find((t) => t.id === to);
    if (targetTask && !targetTask.dependency.includes(from)) {
      targetTask.dependency.push(from);
    }
  }

  /**
   * Removes a dependency association.
   */
  public removeDependency(from: string, to: string) {
    this.dependencies = this.dependencies.filter(
      (d) => !(d.from === from && d.to === to),
    );

    const targetTask = this.tasks.find((t) => t.id === to);
    if (targetTask) {
      targetTask.dependency = targetTask.dependency.filter((id) => id !== from);
    }
  }

  /**
   * Resets all task execution states back to idle.
   */
  public resetAllStates() {
    this.tasks.forEach((task) => {
      task.state = "idle";
      delete task.failureReason;
    });
    this.globalState = "idle";
  }
}

// Global state instance
export const workflowStore = new WorkflowStore();

// Export array references and wrapper functions to ensure full backward compatibility
export const tasks = workflowStore.getTasks();
export const dependencies = workflowStore.getDependencies();
export const setGlobalState = (state: GlobalExecutionState) =>
  workflowStore.setGlobalState(state);

// Named getter to allow safe runtime retrieval of GlobalState
export function getGlobalStateValue(): GlobalExecutionState {
  return workflowStore.getGlobalState();
}

// For legacy modules that import read-only/write access variables directly
export const GlobalState = workflowStore.getGlobalState();
