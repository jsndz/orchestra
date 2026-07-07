import { ipcMain } from "electron";
import { tasks, dependencies } from "../store/index.js";
import {
  detectCycle,
  parallelExecution,
  resolveDependencies,
  shortestPath,
  terminalNodes,
  unreachableNodes,
} from "../utils/graph.js";

export function registerGraphIPC() {
  ipcMain.handle("graph:order", () => {
    return resolveDependencies(dependencies, tasks);
  });

  ipcMain.handle("graph:path", (_, { from, to }) => {
    if (!from || !to) throw new Error("Invalid from or to");
    return shortestPath(dependencies, tasks, from, to);
  });

  ipcMain.handle("graph:cycle", () => {
    const ids = detectCycle(dependencies, tasks);
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    return ids.map((id) => taskMap.get(id)?.task || "");
  });

  ipcMain.handle("graph:parallel", () => {
    return parallelExecution(dependencies, tasks);
  });

  ipcMain.handle("graph:terminal", () => {
    const ids = terminalNodes(dependencies, tasks);
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    return ids.map((id) => taskMap.get(id)?.task || "");
  });

  ipcMain.handle("graph:unreachable", () => {
    const ids = unreachableNodes(dependencies, tasks);
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    return ids.map((id) => taskMap.get(id)?.task || "");
  });
}
