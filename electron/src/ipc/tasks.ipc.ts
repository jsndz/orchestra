import { ipcMain, BrowserWindow } from "electron";
import crypto from "crypto";
import type { Task, Dependency } from "../store/index.js";
import { tasks, dependencies, taskLogs } from "../store/index.js";
import { execute, stopExecution, stopProcess } from "../services/execution.js";
import {
  yamlToDag,
  dagToWorkflow,
  dagToYaml,
  WorkFlowToDAG,
} from "../services/parser.js";
import { getSystemStats } from "../lib/os.js";

export function registerTaskIPC() {
  ipcMain.handle("tasks:get", () => {
    return { tasks, dependencies };
  });

  ipcMain.handle("task:create", (_, body: Partial<Task>) => {
    if (!body.task || !body.command || !body.folder || !body.type) {
      throw new Error("Missing required fields");
    }

    const t: Task = {
      id: crypto.randomUUID(),
      task: body.task,
      command: body.command,
      folder: body.folder,
      dependency: [],
      type: body.type,
      state: "idle",
      ready:
        body.type === "service"
          ? (body.ready ?? { kind: "log", match: "" })
          : { kind: "exit" },
    };

    tasks.push(t);
    return t;
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
    if (!dep.from || !dep.to) {
      throw new Error("Invalid dependency");
    }

    dependencies.push(dep);

    const t = tasks.find((t) => t.id === dep.to);
    if (t && !t.dependency.includes(dep.from)) {
      t.dependency.push(dep.from);
    }

    return { ok: true };
  });

  ipcMain.handle(
    "dependency:remove",
    (_, { from, to }: { from: string; to: string }) => {
      const idx = dependencies.findIndex((d) => d.from === from && d.to === to);

      if (idx === -1) throw new Error("Dependency not found");

      dependencies.splice(idx, 1);

      const task = tasks.find((t) => t.id === to);
      if (task) {
        task.dependency = task.dependency.filter((d) => d !== from);
      }

      return { ok: true };
    },
  );

  ipcMain.on("execution:start", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    console.log("execution");

    const send = (data: any) => {
      win.webContents.send("execution:event", data);
    };

    try {
      const result = await execute(send);

      send({ type: "execution_finished", result });

      return { ok: true };
    } catch (err) {
      send({
        type: "execution_error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw err;
    }
  });

  ipcMain.handle("execution:stop", async () => {
    return await stopExecution();
  });

  ipcMain.handle("task:stop", (_, id: string) => {
    return stopProcess(id);
  });

  ipcMain.handle("yaml:import", (_, yaml: string) => {
    if (!yaml) throw new Error("Missing yaml");

    const dag = yamlToDag(yaml);
    const { tasks: newTasks, dependencies: newDeps } = dagToWorkflow(dag);

    tasks.length = 0;
    dependencies.length = 0;

    tasks.push(...(newTasks as Task[]));
    dependencies.push(...(newDeps as Dependency[]));

    return { ok: true };
  });

  ipcMain.handle("yaml:export", (_, workflow: string) => {
    if (!workflow) throw new Error("Missing workflow name");

    const dag = WorkFlowToDAG(tasks, dependencies, workflow, 1);
    return dagToYaml(dag);
  });

  ipcMain.handle("system:stats", () => {
    return getSystemStats();
  });

  ipcMain.handle("task:logs", (_, taskId: string) => {
    return taskLogs.get(taskId) ?? [];
  });
}
