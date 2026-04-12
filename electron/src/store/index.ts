type TaskState =
  | "idle"
  | "starting"
  | "ready" // service is ready
  | "running" 
  | "completed" // job completed
  | "failed"
  | "stopped"; // manually stop

type ReadyWhen =
  | { kind: "exit" }
  | { kind: "port"; port: number }
  | { kind: "log"; match: string | RegExp, isRegex: boolean };

export type Task = {
  id: string;
  task: string;
  command: string;
  folder: string;
  dependency: string[];
  type: "job" | "service";
  state: TaskState;
  ready?: ReadyWhen;
};
export type Dependency = { from: string; to: string };
export const tasks: Task[] = [];
export const dependencies: Dependency[] = [];


export const EXIT_SENTINEL = "/::TASK_EXIT:(\d+)::/"