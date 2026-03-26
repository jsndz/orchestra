
import { ipcMain } from "electron";
import { tasks, dependencies } from "../store/index.js";
import {
  detectCycle,
  parallelExecution,
  resolveDependencies,
  shortestPath,
  terminalNodes,
  unreachableNodes,
} from "../services/graph.js";

export function registerGraphIPC() {
  ipcMain.handle("graph:order", () => {
    return resolveDependencies(dependencies, tasks);
  });

  ipcMain.handle("graph:path", (_, { from, to }) => {
    if (!from || !to) throw new Error("Invalid from or to");
    return shortestPath(dependencies, tasks, from, to);
  });

  ipcMain.handle("graph:cycle", () => {
    const indices = detectCycle(dependencies, tasks);
    return indices.map((i) => tasks[i].task);
  });

  ipcMain.handle("graph:parallel", () => {
    return parallelExecution(dependencies, tasks);
  });

  ipcMain.handle("graph:terminal", () => {
    return terminalNodes(dependencies, tasks).map(
      (i) => tasks[i].task
    );
  });

  ipcMain.handle("graph:unreachable", () => {
    return unreachableNodes(dependencies, tasks).map(
      (i) => tasks[i].task
    );
  });
}