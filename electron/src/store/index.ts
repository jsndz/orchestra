import type { ChildProcess } from "child_process";

type StepState =
  | "idle"
  | "starting"
  | "ready"// service is ready
  | "running" 
  | "completed" // job completed
  | "failed"
  | "stopped"; //manually stop

type ReadyWhen =
  | { kind: "exit" }
  | { kind: "port"; port: number }
  | { kind: "log"; match: string | RegExp };

export type Task = {
  id: string;
  task: string;
  command: string;
  folder: string;
  dependency: string[];
  type: "job" | "service";
  state: StepState;
  ready?: ReadyWhen;
};
export type Dependency = { from: string; to: string };
export type SendEvent = (event: any) => void;

export const terminal: Map<string, { terminalId: string; taken: boolean }> =
  new Map<string, { terminalId: string; taken: boolean }>();

export const tasks: Task[] = [];
export const dependencies: Dependency[] = [];
export const runningProcesses = new Map<string, ChildProcess>();
export const taskLogs = new Map<string, string[]>();