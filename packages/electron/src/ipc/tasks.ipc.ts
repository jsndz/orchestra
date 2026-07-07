import { ipcMain, dialog, shell } from "electron";
import fs from "fs";
import path from "path";
import { workflowStore } from "../store/index.js";
import { Dependency, Task } from "@orchestra/shared";
import { workflowRunner } from "../services/execution/runner.js";
import {
  yamlToDag,
  dagToWorkflow,
  dagToYaml,
  workflowToDag,
} from "../services/parser.js";
import { getSystemStats } from "../utils/os.js";
import { executeWorkflow } from "../services/execution/index.js";

/**
 * Registers main process IPC handlers related to task lifecycle, imports/exports, and OS metrics.
 */
export function registerTaskIPC() {
  // Query active tasks and dependency lists
  ipcMain.handle("tasks:get", () => {
    return workflowStore.getWorkflow();
  });

  // Open any external web URL
  ipcMain.handle("app:open-external", async (_, url: string) => {
    return await shell.openExternal(url);
  });

  // Dialog window to select local folder path
  ipcMain.handle("select:folder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // Creates and stores a new task
  ipcMain.handle("task:create", (_, body: Partial<Task>) => {
    return workflowStore.createTask(body);
  });

  // Updates properties of a stored task
  ipcMain.handle(
    "task:update",
    (_, { id, data }: { id: string; data: Partial<Task> }) => {
      return workflowStore.updateTask(id, data);
    },
  );

  // Deletes a task and wipes associated references
  ipcMain.handle("task:delete", (_, id: string) => {
    workflowStore.deleteTask(id);
    return { ok: true };
  });

  // Adds a task execution dependency
  ipcMain.handle("dependency:add", (_, dep: Dependency) => {
    workflowStore.addDependency(dep.from, dep.to);
    return { ok: true };
  });

  // Removes a task execution dependency
  ipcMain.handle(
    "dependency:remove",
    (_, { from, to }: { from: string; to: string }) => {
      workflowStore.removeDependency(from, to);
      return { ok: true };
    },
  );

  // Starts the workflow scheduler
  ipcMain.handle("execution:start", async (event) => {
    const wc = event.sender;
    
    // Wire up events from workflowRunner to this WebContents
    const onTerminalCreated = (data: any) => {
      if (!wc.isDestroyed()) wc.send("terminal:created", data);
    };
    const onTerminalData = (data: any) => {
      if (!wc.isDestroyed()) wc.send("terminal:data", data);
    };
    const onTaskLog = (data: any) => {
      if (!wc.isDestroyed()) wc.send("task:log", data);
    };
    const onTaskState = (data: any) => {
      if (!wc.isDestroyed()) wc.send("task:state", data);
    };
    const onGlobalState = (data: any) => {
      if (!wc.isDestroyed()) wc.send("global:state", data);
    };

    // Clean up previous listeners to prevent listener leaks
    workflowRunner.removeAllListeners("terminal:created");
    workflowRunner.removeAllListeners("terminal:data");
    workflowRunner.removeAllListeners("task:log");
    workflowRunner.removeAllListeners("task:state");
    workflowRunner.removeAllListeners("global:state");

    workflowRunner.on("terminal:created", onTerminalCreated);
    workflowRunner.on("terminal:data", onTerminalData);
    workflowRunner.on("task:log", onTaskLog);
    workflowRunner.on("task:state", onTaskState);
    workflowRunner.on("global:state", onGlobalState);

    return executeWorkflow(wc);
  });

  // Stops all currently active tasks
  ipcMain.handle("execution:stop", async () => {
    workflowRunner.stopAllTasks();
  });

  // Signal that frontend terminal component is initialized
  ipcMain.handle("terminal:ready", async (event, id: string) => {
    workflowRunner.handleTerminalReady(id);
  });

  // Terminates a single task by ID
  ipcMain.handle("task:stop", (event, id: string) => {
    return workflowRunner.stopTask(id);
  });

  // Imports a workflow DAG from YAML content
  ipcMain.handle("yaml:import", (_, yaml: string) => {
    if (!yaml) throw new Error("Missing yaml");
    const dag = yamlToDag(yaml);
    const { tasks: newTasks, dependencies: newDeps } = dagToWorkflow(dag);
    workflowStore.setWorkflow(newTasks, newDeps);
    return { ok: true };
  });

  // Exports the current workflow DAG to YAML
  ipcMain.handle("yaml:export", (_, workflow: string) => {
    if (!workflow) throw new Error("Missing workflow name");
    const currentTasks = workflowStore.getTasks();
    const currentDeps = workflowStore.getDependencies();
    const dag = workflowToDag(currentTasks, currentDeps, workflow, 1);
    return dagToYaml(dag);
  });

  // Retreives CPU, memory, and OS stats
  ipcMain.handle("system:stats", () => {
    return getSystemStats();
  });

  // Processes terminal keyboard input
  ipcMain.on("terminal:input", (event, { terminalId, data }) => {
    workflowRunner.handleTerminalInput(terminalId, data);
  });

  // Lists workflows in a workspace directory
  ipcMain.handle("workspace:list", async (_, dirPath: string) => {
    try {
      if (!dirPath) return [];
      const files = await fs.promises.readdir(dirPath);
      const yamlFiles = files.filter(f => f.endsWith(".yaml") || f.endsWith(".yml"));
      
      const workflows = [];
      for (const file of yamlFiles) {
        workflows.push(file.replace(/\.(yaml|yml)$/, ""));
      }
      return workflows;
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  // Loads a workflow from a yaml/yml file
  ipcMain.handle("workspace:load", async (_, { dirPath, name }: { dirPath: string, name: string }) => {
    try {
      const filePath = path.join(dirPath, `${name}.yaml`);
      let content = "";
      if (!fs.existsSync(filePath)) {
        const altFilePath = path.join(dirPath, `${name}.yml`);
        if (fs.existsSync(altFilePath)) {
          content = await fs.promises.readFile(altFilePath, "utf-8");
        } else {
          throw new Error("File not found");
        }
      } else {
        content = await fs.promises.readFile(filePath, "utf-8");
      }
      
      const dag = yamlToDag(content);
      const { tasks: newTasks, dependencies: newDeps } = dagToWorkflow(dag);
      workflowStore.setWorkflow(newTasks, newDeps);
      return { ok: true };
    } catch (e: any) {
      console.error(e);
      return { ok: false, error: e.message };
    }
  });

  // Saves the workflow to a yaml file in a workspace directory
  ipcMain.handle("workspace:save", async (_, { dirPath, name }: { dirPath: string, name: string }) => {
    try {
      const currentTasks = workflowStore.getTasks();
      const currentDeps = workflowStore.getDependencies();
      const dag = workflowToDag(currentTasks, currentDeps, name, 1);
      const content = dagToYaml(dag);
      const filePath = path.join(dirPath, `${name}.yaml`);
      await fs.promises.writeFile(filePath, content, "utf-8");
      return { ok: true };
    } catch (e: any) {
      console.error(e);
      return { ok: false, error: e.message };
    }
  });

  // Imports environment variables from .env file path
  ipcMain.handle("env:import", async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: "Select .env file to import",
        properties: ["openFile"],
        filters: [
          { name: "Environment Files", extensions: ["env"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      const content = await fs.promises.readFile(result.filePaths[0], "utf-8");
      return content;
    } catch (e) {
      console.error("Failed to import .env file:", e);
      return null;
    }
  });
}
