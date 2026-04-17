import { TerminalManager } from "./terminal.manager.js";
import { EXIT_SENTINEL, Task, tasks } from "../store/index.js";
import net from "net";
const terminalManager = new TerminalManager();

export async function runCommand(
  task: Task,
  wc: Electron.WebContents,
): Promise<void> {
  const terminalId = terminalManager.create(task.folder, wc, task);

  updateTaskState(task, "starting", wc);
  terminalManager.run(task.command, terminalId);
  updateTaskState(task, "running", wc);

  if (task.type === "service") {
    try {
      await readinessCheck(task, terminalId, wc);
      return;
    } catch (err) {
      throw err;
    }
  }

  const exitcode = await terminalManager.listenForExitCode(terminalId);

  if (exitcode === 0) {
    updateTaskState(task, "completed", wc);
  } else {
    updateTaskState(task, "failed", wc);
    
    throw new Error(`Command failed with exit code ${exitcode}`);
  }
}

export function stopExecution() {
  terminalManager.killAll();
}

export function stopProcess(id: string, wc: Electron.WebContents) {
  terminalManager.kill(id);
  const task = tasks.find((t) => t.id === id);
  if (task) {
    updateTaskState(task, "stopped", wc);
    setFailureReason(task, "Manually stopped");
  }
}

export function terminalReady(id: string, wc: Electron.WebContents) {
  terminalManager.setReady(id, wc);
}

async function readinessCheck(
  task: Task,
  id: string,
  wc: Electron.WebContents,
): Promise<void> {
  if (task.state === "ready") return;
  if (!task.ready) return;

  if (task.ready.kind === "port") {
    try {
      await waitForPort(task.ready.port);
      updateTaskState(task, "ready", wc);
    } catch (err) {
      updateTaskState(task, "failed", wc);
      setFailureReason(task, `Port ${task.ready.port} not open after timeout`);
      throw err;
    }
    return;
  }

  if (task.ready.kind === "log") {
    try {
      await waitForLog(id, task.ready.match, task.ready.isRegex);
      updateTaskState(task, "ready", wc);
    } catch (err) {
      updateTaskState(task, "failed", wc);
      setFailureReason(task, "Failed to read the required log message till timeout");
      throw err;
    }
    return;
  }

  return;
}

function waitForPort(
  port: number,
  ip = "127.0.0.1",
  timeout = 30000,
): Promise<void> {

  const startTime = Date.now();

  return new Promise<void>((res, rej) => {
    let done = false;

    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      fn();
    };

    const connect = () => {
      const socket = new net.Socket();

      socket.on("connect", () => {
        socket.destroy();
        finish(res);
      });

      socket.on("error", () => {
        socket.destroy();
        retry();
      });

      socket.on("timeout", () => {
        socket.destroy();
        retry();
      });

      socket.connect(port, ip);
    };
    const retry = () => {
      if (Date.now() - startTime > timeout) {
        finish(() => rej(new Error("timeout")));
      } else {
        setTimeout(connect, 200);
      }
    };
    connect();
  });
}

function waitForLog(
  id: string,
  match: string | RegExp,
  isRegEx: boolean,
  timeout = 30000,
): Promise<void> {
  return terminalManager.listenForLog(id, match, isRegEx, timeout);
}

function updateTaskState(
  task: Task,
  state: Task["state"],
  wc: Electron.WebContents,
) {
  task.state = state;

  wc.send("task:state", {
    id: task.id,
    state,
  });
}


function setFailureReason(task: Task, reason: string) {
  task.failureReason = reason;

}