import EventEmitter from "events";
import net from "net";
import { TerminalService } from "./terminal.service.js";
import { TaskLogger } from "../logger.js";
import { workflowStore } from "../../store/index.js";
import { Task, TaskState, GlobalExecutionState } from "@orchestra/shared";

const HOSTS = ["127.0.0.1", "::1", "localhost"];

function tryConnect(port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve();
    });
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error(`Timeout: ${host}:${port}`));
    });
    socket.once("error", (err) => {
      socket.destroy();
      reject(err);
    });
    socket.connect(port, host);
  });
}

export async function pollPort(port: number, timeout = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    for (const host of HOSTS) {
      try {
        await tryConnect(port, host);
        return;
      } catch {
        // continue
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Timeout waiting for port ${port}`);
}

export class WorkflowRunner extends EventEmitter {
  private terminalService = new TerminalService();
  private taskLogger = new TaskLogger();

  public getTerminalService() {
    return this.terminalService;
  }

  public getTaskLogger() {
    return this.taskLogger;
  }

  public updateTaskStatus(task: Task, state: TaskState, failureReason?: string) {
    workflowStore.updateTaskState(task.id, state, failureReason);
    const resolvedFailureReason = failureReason !== undefined ? failureReason : task.failureReason;
    this.emit("task:state", { id: task.id, state, failureReason: resolvedFailureReason });
    this.syncGlobalState();
  }

  public syncGlobalState() {
    let nextState: GlobalExecutionState = "idle";
    const currentTasks = workflowStore.getTasks();

    if (currentTasks.length > 0) {
      if (currentTasks.some((t) => t.state === "failed")) {
        nextState = "failed";
      } else if (
        currentTasks.every(
          (t) =>
            (t.type === "job" && t.state === "completed") ||
            (t.type === "service" && t.state === "ready"),
        )
      ) {
        nextState = "completed";
      } else if (
        currentTasks.some((t) => ["starting", "running"].includes(t.state))
      ) {
        nextState = "running";
      }
    }

    if (workflowStore.getGlobalState() !== nextState) {
      workflowStore.setGlobalState(nextState);
      this.emit("global:state", nextState);
    }
  }

  public async runTask(task: Task): Promise<void> {
    const maxAttempts = (task.retries ?? 0) + 1;
    let attempt = 0;

    // Ensure task log files are clean before starting execution
    this.taskLogger.resetLogFile(task);

    while (attempt < maxAttempts) {
      attempt++;
      let terminalId = "";
      let timeoutId: NodeJS.Timeout | null = null;

      // Direct helper callback to pipe output to both UI and the task-specific log file
      const logForwarder = (termId: string, text: string) => {
        this.taskLogger.writeLogToFile(task, text);
        if (this.terminalService.isTerminalReady(termId)) {
          this.emit("terminal:data", { terminalId: termId, data: text });
        }
      };

      try {
        if (task.ready && task.ready.kind === "port" && task.ready.port) {
          const { checkPort } = await import("../../utils/ports.js");
          const portInfo = await checkPort(task.ready.port);
          if (portInfo.inUse) {
            const processDesc = portInfo.command ? `'${portInfo.command}' (PID: ${portInfo.pid})` : "an unknown process";
            const errMsg = `Port ${task.ready.port} is already in use by ${processDesc}.`;
            this.updateTaskStatus(task, "failed", errMsg);
            throw new Error(errMsg);
          }
        }

        terminalId = this.terminalService.create(
          task.folder,
          task,
          (id: string, name: string) => {
            this.emit("terminal:created", { terminalId: id, name });
          },
          (id: string, data: string) => {
            this.taskLogger.writeLogToFile(task, data);
            if (this.terminalService.isTerminalReady(id)) {
              this.emit("terminal:data", { terminalId: id, data });
            }

            this.taskLogger.processLogChunk(task, data, (line: string, rule?: any) => {
              this.emit("task:log", {
                taskId: task.id,
                message: line,
                ts: Date.now(),
                ...(rule && {
                  color: rule.color,
                  ruleId: rule.id,
                  label: rule.label,
                }),
              });
            });
          },
          () => {} // Process exit handled via resolve/reject listeners below
        );

        this.updateTaskStatus(task, "starting");

        if (attempt > 1) {
          this.terminalService.injectSystemLog(
            terminalId,
            `\r\n\x1b[1;33m[Retrying task: attempt ${attempt} of ${maxAttempts}...]\x1b[0m\r\n`,
            logForwarder
          );
        }

        this.terminalService.run(task.command, terminalId, logForwarder);
        this.updateTaskStatus(task, "running");

        const executePromise = async () => {
          if (task.type === "service") {
            await this.waitForReadiness(task, terminalId);
          } else {
            const exitCode = await this.terminalService.listenForExitCode(terminalId);
            if (exitCode !== 0) {
              throw new Error(`Command failed with exit code ${exitCode}`);
            }
          }
        };

        if (task.timeout && task.timeout > 0) {
          const timeoutMs = task.timeout * 1000;
          const timeoutPromise = new Promise<void>((_, reject) => {
            timeoutId = setTimeout(() => {
              this.terminalService.kill(terminalId);
              reject(new Error(`Timeout: Task exceeded limit of ${task.timeout}s`));
            }, timeoutMs);
          });

          await Promise.race([executePromise(), timeoutPromise]);
        } else {
          await executePromise();
        }

        this.updateTaskStatus(task, task.type === "service" ? "ready" : "completed");
        if (timeoutId) clearTimeout(timeoutId);
        return;

      } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId);
        if (terminalId) this.terminalService.kill(terminalId);

        const errorMessage = err.message || "Unknown error";
        workflowStore.updateTaskState(task.id, task.state, errorMessage);

        if (attempt < maxAttempts) {
          this.terminalService.injectSystemLog(
            terminalId,
            `\r\n\x1b[1;31m[Attempt ${attempt} failed: ${errorMessage}. Retrying in 1s...]\x1b[0m\r\n`,
            logForwarder
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          this.updateTaskStatus(task, "failed", errorMessage);
          throw err;
        }
      }
    }
  }

  private async waitForReadiness(task: Task, terminalId: string): Promise<void> {
    if (task.state === "ready" || !task.ready) return;

    if (task.ready.kind === "port") {
      try {
        await pollPort(task.ready.port);
        this.updateTaskStatus(task, "ready");
      } catch (err) {
        workflowStore.updateTaskState(task.id, task.state, `Port ${task.ready.port} not open after timeout`);
        throw err;
      }
    } else if (task.ready.kind === "log") {
      try {
        await this.terminalService.listenForLog(
          terminalId,
          task.ready.match,
          task.ready.isRegex,
        );
        this.updateTaskStatus(task, "ready");
      } catch (err) {
        workflowStore.updateTaskState(task.id, task.state, "Failed to detect readiness log message");
        throw err;
      }
    }
  }

  public stopAllTasks() {
    this.terminalService.killAll();
    const currentTasks = workflowStore.getTasks();
    currentTasks.forEach((task) => {
      if (["running", "starting", "ready"].includes(task.state)) {
        this.updateTaskStatus(task, "stopped", "Execution Stopped");
      }
    });
    this.syncGlobalState();
  }

  public stopTask(id: string) {
    this.terminalService.kill(id);
    const task = workflowStore.getTasks().find((t) => t.id === id);
    if (task) {
      this.updateTaskStatus(task, "stopped", "Terminal Closed");
    }
  }

  public handleTerminalReady(id: string) {
    this.terminalService.setReady(id, (termId: string, data: string) => {
      this.emit("terminal:data", { terminalId: termId, data });
    });
  }

  public handleTerminalInput(terminalId: string, data: string) {
    const taskId = this.terminalService.getTaskIdByTerminalId(terminalId);
    if (data === "\x03") { // Ctrl+C
      const task = workflowStore.getTasks().find((t) => t.id === taskId);
      if (task) {
        this.updateTaskStatus(task, "stopped", "Interrupted (Ctrl+C)");
      }
    }
    this.terminalService.write(terminalId, data);
  }

  public clearTerminalService() {
    this.terminalService.clearAll();
  }
}

export const workflowRunner = new WorkflowRunner();

// Backward compatibility wrapper
export function runTask(task: Task, wc?: any): Promise<void> {
  return workflowRunner.runTask(task);
}
