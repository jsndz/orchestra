import { TerminalManager } from "./terminal.manager";
import { EXIT_SENTINEL, Task, tasks } from "../store";
import net from "net";
const terminalManager = new TerminalManager();

export async function runCommand(
  task: Task,
  wc: Electron.WebContents,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const terminalId = terminalManager.create(task.folder, wc);
    task.state = "starting";
    terminalManager.run(task.command, terminalId);
    task.state = "running";
    const exitcode = await terminalManager.listenForExitCode(terminalId);
    console.log(exitcode);
    if (exitcode === 0) {
      task.state = "completed";
      resolve();
    } else {
      task.state = "failed";
      reject(new Error(`Command failed with exit code ${exitcode}`));
    }
    if (task.type === "service") {
      await readinessCheck(task, terminalId);
      resolve();
    }
  });
}

export function stopExecution() {
  terminalManager.killAll();
}

export function stopProcess(id: string) {
  terminalManager.kill(id);
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.state = "stopped";
  }
}

export function terminalReady(id: string, wc: Electron.WebContents) {
  terminalManager.setReady(id, wc);
}

async function readinessCheck(task: Task, id: string): Promise<void> {
  if (task.state === "ready") return;
  if (!task.ready) return;

  if (task.ready.kind === "port") {
    waitForPort(task.ready.port)
      .then(() => {
        task.state = "ready";
      })
      .catch((err) => {
        task.state = "failed";
      });
    return;
  }

  if (task.ready.kind === "log") {
    await waitForLog(id, task.ready.match)
      .then(() => {
        task.state = "ready";
      })
      .catch((err) => {
        task.state = "failed";
      });
    return;
  }
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
  timeout = 30000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    terminalManager.listenForLog(id, match);
    const cleanup = () => {
      clearTimeout(timer);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("log readiness timeout"));
    }, timeout);
  });
}
