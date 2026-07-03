import net from "net";
import { TerminalService } from "../terminal.service.js";
import { TaskLogger } from "../logger.service.js";
import { workflowStore } from "../../store/index.js";
import { Task, TaskState, GlobalExecutionState } from "@orchestra/shared";

const terminalService = new TerminalService();
const taskLogger = new TaskLogger();

/**
 * Runs a single workflow task. Handles retry loops, stdout readiness triggers, and timeout limits.
 */
export async function runTask(
  task: Task,
  wc: Electron.WebContents,
): Promise<void> {
  const maxAttempts = (task.retries ?? 0) + 1;
  let attempt = 0;

  // Ensure task log files are clean before starting execution
  taskLogger.resetLogFile(task);

  while (attempt < maxAttempts) {
    attempt++;
    let terminalId = "";
    let timeoutId: NodeJS.Timeout | null = null;

    // Direct helper callback to pipe output to both UI and the task-specific log file
    const logForwarder = (termId: string, text: string) => {
      taskLogger.writeLogToFile(task, text);
      if (terminalService.isTerminalReady(termId) && wc && !wc.isDestroyed()) {
        wc.send("terminal:data", { terminalId: termId, data: text });
      }
    };

    try {
      terminalId = terminalService.create(
        task.folder,
        task,
        (id, name) => {
          if (wc && !wc.isDestroyed()) {
            wc.send("terminal:created", { terminalId: id, name });
          }
        },
        (id, data) => {
          taskLogger.writeLogToFile(task, data);
          if (terminalService.isTerminalReady(id) && wc && !wc.isDestroyed()) {
            wc.send("terminal:data", { terminalId: id, data });
          }

          taskLogger.processLogChunk(task, data, (line, rule) => {
            if (wc && !wc.isDestroyed()) {
              wc.send("task:log", {
                taskId: task.id,
                message: line,
                ts: Date.now(),
                ...(rule && {
                  color: rule.color,
                  ruleId: rule.id,
                  label: rule.label,
                }),
              });
            }
          });
        },
        () => {} // Process exit handled via resolve/reject listeners below
      );

      updateTaskStatus(task, "starting", wc);

      if (attempt > 1) {
        terminalService.injectSystemLog(
          terminalId,
          `\r\n\x1b[1;33m[Retrying task: attempt ${attempt} of ${maxAttempts}...]\x1b[0m\r\n`,
          logForwarder
        );
      }

      terminalService.run(task.command, terminalId, logForwarder);
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

      updateTaskStatus(task, task.type === "service" ? "ready" : "completed", wc);
      if (timeoutId) clearTimeout(timeoutId);
      return;

    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      if (terminalId) terminalService.kill(terminalId);

      const errorMessage = err.message || "Unknown error";
      workflowStore.updateTaskState(task.id, task.state, errorMessage);

      if (attempt < maxAttempts) {
        terminalService.injectSystemLog(
          terminalId,
          `\r\n\x1b[1;31m[Attempt ${attempt} failed: ${errorMessage}. Retrying in 1s...]\x1b[0m\r\n`,
          logForwarder
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        updateTaskStatus(task, "failed", wc, errorMessage);
        throw err;
      }
    }
  }
}

/**
 * Disposes all active terminal processes.
 */
export function clearTerminalService() {
  terminalService.clearAll();
}

/**
 * Triggers termination of all executing workflow processes.
 */
export function stopAllTasks(wc: Electron.WebContents) {
  terminalService.killAll();

  const currentTasks = workflowStore.getTasks();
  currentTasks.forEach((task) => {
    if (["running", "starting", "ready"].includes(task.state)) {
      updateTaskStatus(task, "stopped", wc, "Execution Stopped");
    }
  });

  syncGlobalState(wc);
}

/**
 * Stops an individual task by its unique ID.
 */
export function stopTask(id: string, wc: Electron.WebContents) {
  terminalService.kill(id);
  const task = workflowStore.getTasks().find((t) => t.id === id);
  if (task) {
    updateTaskStatus(task, "stopped", wc, "Terminal Closed");
  }
}

/**
 * Signals that the renderer terminal component is ready to receive historical logs.
 */
export function handleTerminalReady(id: string, wc: Electron.WebContents) {
  terminalService.setReady(id, (termId, data) => {
    if (wc && !wc.isDestroyed()) {
      wc.send("terminal:data", { terminalId: termId, data });
    }
  });
}

/**
 * Forwards keyboard input to the task process.
 */
export function handleTerminalInput(
  terminalId: string,
  data: string,
  wc: Electron.WebContents,
) {
  const taskId = terminalService.getTaskIdByTerminalId(terminalId);
  if (data === "\x03") { // Ctrl+C
    const task = workflowStore.getTasks().find((t) => t.id === taskId);
    if (task) {
      updateTaskStatus(task, "stopped", wc, "Interrupted (Ctrl+C)");
    }
  }
  terminalService.write(terminalId, data);
}

/**
 * Helper to block execution until a port or log matches readiness criteria.
 */
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
      workflowStore.updateTaskState(task.id, task.state, `Port ${task.ready.port} not open after timeout`);
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
      workflowStore.updateTaskState(task.id, task.state, "Failed to detect readiness log message");
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

/**
 * Polls local interfaces checking for a listening port to open.
 */
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

/**
 * Helper to update a task status in the store, notify the UI, and synchronize global state.
 */
function updateTaskStatus(
  task: Task,
  state: TaskState,
  wc: Electron.WebContents,
  failureReason?: string
) {
  workflowStore.updateTaskState(task.id, state, failureReason);
  if (wc && !wc.isDestroyed()) {
    wc.send("task:state", { id: task.id, state });
  }
  syncGlobalState(wc);
}

/**
 * Synchronizes the global state with the statuses of individual tasks.
 */
function syncGlobalState(wc: Electron.WebContents) {
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
    if (wc && !wc.isDestroyed()) {
      wc.send("global:state", nextState);
    }
  }
}
