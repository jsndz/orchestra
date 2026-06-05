import net from "net";
import { TerminalService } from "../terminal.service.js";
import {
  tasks,
  GlobalState,
  setGlobalState,
} from "../../store/index.js";
import { Task, TaskState, GlobalExecutionState } from "../../types/index.js";

const terminalService = new TerminalService();

export async function runTask(
  task: Task,
  wc: Electron.WebContents,
): Promise<void> {
  const maxAttempts = (task.retries ?? 0) + 1;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    let terminalId = "";
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      terminalId = terminalService.create(task.folder, wc, task);
      updateTaskStatus(task, "starting", wc);

      if (attempt > 1) {
        // Send a retry log to the terminal so the user knows it is retrying
        terminalService.injectSystemLog(
          terminalId,
          `\r\n\x1b[1;33m[Retrying task: attempt ${attempt} of ${maxAttempts}...]\x1b[0m\r\n`
        );
      }

      terminalService.run(task.command, terminalId);
      updateTaskStatus(task, "running", wc);

      const executePromise = async () => {
        if (task.type === "service") {
          await waitForReadiness(task, terminalId, wc);
        } else {
          const exitCode = await terminalService.listenForExitCode(terminalId);
          if (exitCode !== 0) {
            throw new Error(`Command failed with exit code ${exitCode}`);
          }
        }
      };

      if (task.timeout && task.timeout > 0) {
        const timeoutMs = task.timeout * 1000;
        const timeoutPromise = new Promise<void>((_, reject) => {
          timeoutId = setTimeout(() => {
            terminalService.kill(terminalId);
            reject(new Error(`Timeout: Task exceeded limit of ${task.timeout}s`));
          }, timeoutMs);
        });

        await Promise.race([executePromise(), timeoutPromise]);
      } else {
        await executePromise();
      }

      // If we succeed:
      updateTaskStatus(task, task.type === "service" ? "ready" : "completed", wc);
      if (timeoutId) clearTimeout(timeoutId);
      return; // Success! Exit the function

    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      if (terminalId) terminalService.kill(terminalId);

      const errorMessage = err.message || "Unknown error";
      task.failureReason = errorMessage;

      if (attempt < maxAttempts) {
        // Log the failure and retry
        terminalService.injectSystemLog(
          terminalId,
          `\r\n\x1b[1;31m[Attempt ${attempt} failed: ${errorMessage}. Retrying in 1s...]\x1b[0m\r\n`
        );
        // We set task state to "starting" or "running" again in next loop iteration
        await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1s before retry
      } else {
        // Max attempts reached, fail the task
        updateTaskStatus(task, "failed", wc);
        throw err;
      }
    }
  }
}

export function clearTerminalService() {
  terminalService.clearAll();
}


export function stopAllTasks(wc: Electron.WebContents) {
  terminalService.killAll();
  tasks.forEach((task) => {
    if (["running", "starting", "ready"].includes(task.state)) {
      updateTaskStatus(task, "stopped", wc);
      task.failureReason = "Execution Stopped";
    }
  });
  syncGlobalState(wc);
}

export function stopTask(id: string, wc: Electron.WebContents) {
  terminalService.kill(id);
  const task = tasks.find((t) => t.id === id);
  if (task) {
    updateTaskStatus(task, "stopped", wc);
    task.failureReason = "Terminal Closed";
  }
}

export function handleTerminalReady(id: string, wc: Electron.WebContents) {
  terminalService.setReady(id, wc);
}

export function handleTerminalInput(
  terminalId: string,
  data: string,
  wc: Electron.WebContents,
) {
  const taskId = terminalService.getTaskIdByTerminalId(terminalId);
  if (data === "\x03") { // Ctrl+C
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      updateTaskStatus(task, "stopped", wc);
      task.failureReason = "Interrupted (Ctrl+C)";
    }
  }
  terminalService.write(terminalId, data);
}

async function waitForReadiness(
  task: Task,
  terminalId: string,
  wc: Electron.WebContents,
): Promise<void> {
  if (task.state === "ready" || !task.ready) return;

  if (task.ready.kind === "port") {
    try {
      await pollPort(task.ready.port);
      updateTaskStatus(task, "ready", wc);
    } catch (err) {
      task.failureReason = `Port ${task.ready.port} not open after timeout`;
      throw err;
    }
  } else if (task.ready.kind === "log") {
    try {
      await terminalService.listenForLog(
        terminalId,
        task.ready.match,
        task.ready.isRegex,
      );
      updateTaskStatus(task, "ready", wc);
    } catch (err) {
      task.failureReason = "Failed to detect readiness log message";
      throw err;
    }
  }
}


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

export async function pollPort(
  port: number,
  timeout = 30000,
): Promise<void> {
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

function updateTaskStatus(
  task: Task,
  state: TaskState,
  wc: Electron.WebContents,
) {
  task.state = state;
  if (wc && !wc.isDestroyed()) {
    wc.send("task:state", { id: task.id, state });
  }
  syncGlobalState(wc);
}

function syncGlobalState(wc: Electron.WebContents) {
  let nextState: GlobalExecutionState = "idle";

  if (tasks.length > 0) {
    if (tasks.some((t) => t.state === "failed")) {
      nextState = "failed";
    } else if (
      tasks.every(
        (t) =>
          (t.type === "job" && t.state === "completed") ||
          (t.type === "service" && t.state === "ready"),
      )
    ) {
      nextState = "completed";
    } else if (
      tasks.some((t) => ["starting", "running"].includes(t.state))
    ) {
      nextState = "running";
    }
  }

  if (GlobalState !== nextState) {
    setGlobalState(nextState);
    if (wc && !wc.isDestroyed()) {
      wc.send("global:state", nextState);
    }
  }
}
