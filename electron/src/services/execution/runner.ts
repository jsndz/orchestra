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
  const terminalId = terminalService.create(task.folder, wc, task);

  updateTaskStatus(task, "starting", wc);
  terminalService.run(task.command, terminalId);
  updateTaskStatus(task, "running", wc);

  if (task.type === "service") {
    try {
      await waitForReadiness(task, terminalId, wc);
      return;
    } catch (err) {
      updateTaskStatus(task, "failed", wc);
      throw err;
    }
  }

  const exitCode = await terminalService.listenForExitCode(terminalId);

  if (exitCode === 0) {
    updateTaskStatus(task, "completed", wc);
  } else {
    updateTaskStatus(task, "failed", wc);
    task.failureReason = `Command failed with exit code ${exitCode}`;
    throw new Error(task.failureReason);
  }
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

function pollPort(
  port: number,
  host = "127.0.0.1",
  timeout = 30000,
): Promise<void> {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket
        .on("connect", () => {
          socket.destroy();
          resolve();
        })
        .on("error", () => {
          socket.destroy();
          if (Date.now() - startTime > timeout) {
            reject(new Error("Timeout waiting for port"));
          } else {
            setTimeout(attempt, 200);
          }
        })
        .on("timeout", () => {
          socket.destroy();
          attempt();
        })
        .connect(port, host);
    };
    attempt();
  });
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
