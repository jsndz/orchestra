import { Task } from ".";

export {};

declare global {
  interface Window {
    api: {
      // TASKS
      getTasks: () => Promise<{ tasks: Task[]; dependencies: any[] }>;
      createTask: (data: Partial<Task>) => Promise<Task>;
      updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
      deleteTask: (id: string) => Promise<{ ok: boolean }>;

      // DEPENDENCIES
      addDependency: (dep: { from: string; to: string }) => Promise<{ ok: true }>;
      removeDependency: (from: string, to: string) => Promise<{ ok: true }>;

      // GRAPH
      getOrder: () => Promise<any>;
      getPath: (from: string, to: string) => Promise<any>;
      detectCycle: () => Promise<string[]>;
      getParallel: () => Promise<any>;
      getTerminal: () => Promise<string[]>;
      getUnreachable: () => Promise<string[]>;

      // EXECUTION
      startExecution: () => void;
      stopExecution: () => Promise<any>;
      stopTask: (id: string) => Promise<any>;
      onExecutionEvent: (cb: (data: any) => void) => () => void;
      onTaskStateChange: (cb: (data: any) => void) => () => void;
      onTerminalCreated: (cb: (config: any) => void) => () => void;
      terminalReady: (id: string) => void;
      // YAML
      importYaml: (yaml: string) => Promise<{ ok: true }>;
      exportYaml: (workflow: string) => Promise<string>;

      // SYSTEM
      getSystemStats: () => Promise<any>;



      // LOGS
      getTaskLogs: (taskId: string) => Promise<string[]>;
    };
  }
}