export type TaskState =
  | "idle"
  | "starting"
  | "ready" // service is ready
  | "running"
  | "completed" // job completed
  | "failed"
  | "stopped"; // manually stop

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

export type Task = {
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
};

export type Dependency = {
  from: string;
  to: string;
};
