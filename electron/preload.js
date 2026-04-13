const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getTasks: () => ipcRenderer.invoke("tasks:get"),

  createTask: (data) => ipcRenderer.invoke("task:create", data),

  updateTask: (id, data) => ipcRenderer.invoke("task:update", { id, data }),

  deleteTask: (id) => ipcRenderer.invoke("task:delete", id),

  addDependency: (dep) => ipcRenderer.invoke("dependency:add", dep),

  removeDependency: (from, to) =>
    ipcRenderer.invoke("dependency:remove", { from, to }),

  getOrder: () => ipcRenderer.invoke("graph:order"),

  getPath: (from, to) => ipcRenderer.invoke("graph:path", { from, to }),

  detectCycle: () => ipcRenderer.invoke("graph:cycle"),

  getParallel: () => ipcRenderer.invoke("graph:parallel"),

  getTerminal: () => ipcRenderer.invoke("graph:terminal"),

  getUnreachable: () => ipcRenderer.invoke("graph:unreachable"),

  startExecution: () => ipcRenderer.invoke("execution:start"),

  stopExecution: () => ipcRenderer.invoke("execution:stop"),

  onEvent: (cb) => {
    const listener = (_, data) => cb(data);
    ipcRenderer.on("execution:event", listener);

    return () => {
      ipcRenderer.removeListener("execution:event", listener);
    };
  },

  stopTask: (id) => ipcRenderer.invoke("task:stop", id),

  onTerminalCreated: (callback) => {
    const listener = (_, config) => callback(config);
    ipcRenderer.on("terminal:created", listener);
    return () => ipcRenderer.removeListener("terminal:created", listener);
  },
  onExecutionEvent: (callback) => {
    const listener = (_, data) => callback(data);
    ipcRenderer.on("terminal:data", listener);
    return () => ipcRenderer.removeListener("terminal:data", listener);
  },
  onTaskStateChange: (callback) => {
    const listener = (_, data) => callback(data);
    ipcRenderer.on("task:state", listener);
    return () => ipcRenderer.removeListener("task:state", listener);
  },
  onTaskLog: (callback) => {
    const listener = (_, data) => callback(data);
    ipcRenderer.on("task:log", listener);

    return () => ipcRenderer.removeListener("task:log", listener);
  },  
  terminalReady: (taskId) => ipcRenderer.invoke("terminal:ready", taskId),

  importYaml: (yaml) => ipcRenderer.invoke("yaml:import", yaml),

  exportYaml: (workflow) => ipcRenderer.invoke("yaml:export", workflow),

  getSystemStats: () => ipcRenderer.invoke("system:stats"),

  // getTaskLogs: (taskId) => ipcRenderer.invoke("task:logs", taskId),
});
