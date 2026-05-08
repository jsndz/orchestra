import { ipcMain, dialog, shell } from "electron";
import crypto from "crypto";
import { tasks, dependencies } from "../store/index.js";
import { Task, Dependency } from "../types/index.js";
import {
  handleTerminalInput,
  stopAllTasks,
  stopTask,
  handleTerminalReady,
} from "../services/execution/runner.js";
import {
  yamlToDag,
  dagToWorkflow,
  dagToYaml,
  workflowToDag,
} from "../services/parser.js";
import { getSystemStats } from "../utils/os.js";
import { executeWorkflow } from "../services/execution/index.js";

export function registerTaskIPC() {
  ipcMain.handle("tasks:get", () => {
    return { tasks, dependencies };
  });

  ipcMain.handle("app:open-external", async (_, url: string) => {
    return await shell.openExternal(url);
  });

  ipcMain.handle("select:folder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle("task:create", (_, body: Partial<Task>) => {
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
    };

    tasks.push(newTask);
    return newTask;
  });

  ipcMain.handle(
    "task:update",
    (_, { id, data }: { id: string; data: Partial<Task> }) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) throw new Error("Task not found");

      delete (data as any).id;

      Object.assign(task, data);
      return task;
    },
  );

  ipcMain.handle("task:delete", (_, id: string) => {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx !== -1) tasks.splice(idx, 1);

    for (let i = dependencies.length - 1; i >= 0; i--) {
      if (dependencies[i].from === id || dependencies[i].to === id) {
        dependencies.splice(i, 1);
      }
    }
    return { ok: true };
  });

  ipcMain.handle("dependency:add", (_, dep: Dependency) => {
    if (!dep.from || !dep.to) throw new Error("Invalid dependency");

    dependencies.push(dep);
    const targetTask = tasks.find((t) => t.id === dep.to);
    if (targetTask && !targetTask.dependency.includes(dep.from)) {
      targetTask.dependency.push(dep.from);
    }
    return { ok: true };
  });

  ipcMain.handle(
    "dependency:remove",
    (_, { from, to }: { from: string; to: string }) => {
      const idx = dependencies.findIndex((d) => d.from === from && d.to === to);
      if (idx === -1) throw new Error("Dependency not found");

      dependencies.splice(idx, 1);
      const targetTask = tasks.find((t) => t.id === to);
      if (targetTask) {
        targetTask.dependency = targetTask.dependency.filter((id) => id !== from);
      }
      return { ok: true };
    },
  );

  ipcMain.handle("execution:start", async (event) => {
    return executeWorkflow(event.sender);
  });

  ipcMain.handle("execution:stop", async (event) => {
    stopAllTasks(event.sender);
  });

  ipcMain.handle("terminal:ready", async (event, id: string) => {
    handleTerminalReady(id, event.sender);
  });

  ipcMain.handle("task:stop", (event, id: string) => {
    return stopTask(id, event.sender);
  });

  ipcMain.handle("yaml:import", (_, yaml: string) => {
    if (!yaml) throw new Error("Missing yaml");
    const dag = yamlToDag(yaml);
    const { tasks: newTasks, dependencies: newDeps } = dagToWorkflow(dag);

    tasks.length = 0;
    dependencies.length = 0;
    tasks.push(...newTasks);
    dependencies.push(...newDeps);

    return { ok: true };
  });

  ipcMain.handle("yaml:export", (_, workflow: string) => {
    if (!workflow) throw new Error("Missing workflow name");
    const dag = workflowToDag(tasks, dependencies, workflow, 1);
    return dagToYaml(dag);
  });

  ipcMain.handle("system:stats", () => {
    return getSystemStats();
  });

  ipcMain.on("terminal:input", (event, { terminalId, data }) => {
    handleTerminalInput(terminalId, data, event.sender);
  });
}
