export type TaskState =
  | "idle"
  | "starting"
  | "ready" // service is ready
  | "running"
  | "completed" // job completed
  | "failed"
  | "stopped"; // manually stop

// Alias for client compatibility
export type StepState = TaskState;

export type GlobalExecutionState = "idle" | "running" | "completed" | "failed";

export type ReadyWhen =
  | { kind: "exit" }
  | { kind: "port"; port: number }
  | { kind: "log"; match: string | RegExp; isRegex: boolean };

export type LogRule = {
  id: string;
  label: string;
  match: string | RegExp;
  isRegex: boolean;
  color?: string;
  enabled: boolean;
};

export interface Task {
  id: string;
  task: string;
  command: string;
  folder: string;
  dependency: string[];
  type: "job" | "service";
  state: TaskState;
  ready?: ReadyWhen;
  failureReason?: string;
  logRules?: LogRule[];
  x?: number;
  y?: number;
  retries?: number;
  timeout?: number;
  env?: Record<string, string>;
}

export interface Dependency {
  from: string;
  to: string;
}

export type StateCounts = Record<TaskState, number>;

export type TaskRequest = {
  task: string;
  folder: string;
  command: string;
  type: "job" | "service";
  ready?: ReadyWhen;
  logRules?: LogRule[];
  x?: number;
  y?: number;
  retries?: number;
  timeout?: number;
  env?: Record<string, string>;
};

export interface OrderResponse {
  success: boolean;
  order?: string[];
  cycle?: string;
}

export interface CycleResponse {
  hasCycle: boolean;
  cycle?: number[];
}

export interface ParallelLevel {
  level: number;
  tasks: string[];
}

export interface PathResponse {
  path?: string[];
  error?: string;
}

export type TerminalOpenEvent = {
  type: "terminal_open";
  terminalId: string;
  name: string;
  taskId: string;
};

export type TaskStartedEvent = {
  type: "task_started";
  terminalId: string;
  taskId: string;
  name: string;
  folder: string;
  command: string;
};

export type TaskStdoutEvent = {
  type: "task_stdout";
  terminalId: string;
  taskId: string;
  data: string;
};

export type TaskStderrEvent = {
  type: "task_stderr";
  terminalId: string;
  taskId: string;
  data: string;
};

export type TaskFinishedEvent = {
  type: "task_finished";
  terminalId: string;
  taskId: string;
  status: "success" | "failed";
};

export type TaskStateEvent = {
  type: "task_state";
  terminalId: string;
  taskId: string;
  state: TaskState;
};

export type Events =
  | TerminalOpenEvent
  | TaskStartedEvent
  | TaskStdoutEvent
  | TaskStderrEvent
  | TaskFinishedEvent
  | TaskStateEvent;

export type TerminalUIState = {
  terminalId: string;
  taskId: string;
  status: "running" | "success" | "failed";
  name?: string;
  folder?: string;
};

export type TerminalsState = Record<string, TerminalUIState>;
