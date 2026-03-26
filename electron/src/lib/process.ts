import { ChildProcess, spawn } from "child_process";
import net from "net";
import crypto from "crypto";

import {
  runningProcesses,
  SendEvent,
  taskLogs,
  tasks,
  terminal,
  type Task,
} from "../store";

function sendState(send: SendEvent, task: Task) {
  const entry = terminal.get(task.id);

  if (!entry) return;
  send({
    type: "task_state",
    terminalId: terminal.get(task.id)?.terminalId,
    taskId: task.id,
    state: task.state,
  });
}

function selectTerminalId(task: Task): string {
  function createTerminalId() {
    return `term-${crypto.randomUUID()}`;
  }

  if (task.dependency.length === 0) {
    const id = createTerminalId();
    terminal.set(task.id, { terminalId: id, taken: false });
    return id;
  }

  for (const depId of task.dependency) {
    const parentTask = tasks.find((t) => t.id === depId);
    const parentTerminal = terminal.get(depId);

    if (!parentTask || !parentTerminal) continue;

    if (parentTask.type === "service") continue;

    if (!parentTerminal.taken) {
      parentTerminal.taken = true;

      terminal.set(task.id, {
        terminalId: parentTerminal.terminalId,
        taken: true,
      });

      return parentTerminal.terminalId;
    }
  }

  const id = createTerminalId();
  terminal.set(task.id, { terminalId: id, taken: false });

  return id;
}

export async function runCommand(task: Task, send: SendEvent): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const command = task.command;
    const folder = task.folder;

    if (!command || typeof command !== "string") {
      reject(new Error(`Invalid command: ${command}`));
      return;
    }

    const terminalId = selectTerminalId(task);

    taskLogs.set(task.id, []);

    send({
      type: "terminal_open",
      terminalId,
      name: task.task,
      taskId: task.id,
    });

    send({
      type: "task_started",
      terminalId,
      taskId: task.id,
      data: `execution@${task.task}:~${folder}$ ${command}\r\n`,
      command,
      folder,
    });

    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];

    const child = spawn(cmd!, parts.slice(1), {
      cwd: folder,
      shell: true,
      detached: true,
      stdio: "pipe",
    });

    task.state = "running";
    sendState(send, task);

    runningProcesses.set(task.id, child);

    child.stdout.on("data", (d) => {
      const output = d.toString();

      if (!taskLogs.has(task.id)) {
        taskLogs.set(task.id, []);
      }

      taskLogs.get(task.id)!.push(output);

      send({
        type: "task_stdout",
        terminalId,
        taskId: task.id,
        data: output,
      });
    });

    child.stderr.on("data", (d) => {
      const output = d.toString();

      if (!taskLogs.has(task.id)) {
        taskLogs.set(task.id, []);
      }

      taskLogs.get(task.id)!.push(output);

      send({
        type: "task_stderr",
        terminalId,
        taskId: task.id,
        data: output,
      });
    });

    child.on("close", (code: number | null) => {
      const entry = terminal.get(task.id);
      if (entry) entry.taken = false;

      const ok = code === 0 || code === null;

      if (task.type === "job") {
        task.state = ok ? "completed" : "failed";
        sendState(send, task);
      }

      runningProcesses.delete(task.id);

      send({
        type: "task_finished",
        terminalId,
        taskId: task.id,
        status: ok ? "success" : "failed",
        exitCode: code,
      });

      if (ok) resolve();
      else reject();
    });

    child.on("error", () => {
      reject(new Error(`Failed to start process for task ${task.task}`));
    });

    if (task.type === "service") {
      readinessCheck(task, child, send)
        .then(() => resolve())
        .catch(() => {});
      return;
    }
  });
}

async function readinessCheck(
  task: Task,
  child: ChildProcess,
  send: SendEvent,
): Promise<void> {
  if (task.state === "ready") return;
  if (!task.ready) return;

  if (task.ready.kind === "port") {
    await waitForPort(task.ready.port, child);
    task.state = "ready";
    sendState(send, task);
    return;
  }

  if (task.ready.kind === "log") {
    await waitForLog(child, task.ready.match);
    task.state = "ready";
    sendState(send, task);
    return;
  }
}

function waitForPort(
  port: number,
  child: ChildProcess,
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

    child.once("exit", () => {
      finish(() => rej(new Error("process exited before port was ready")));
    });

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
  child: ChildProcess,
  match: string | RegExp,
  timeout = 30000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const MAX_BUFFER = 10000;

    const onData = (d: Buffer) => {
      buffer += d.toString("utf8");

      if (buffer.length > MAX_BUFFER) {
        buffer = buffer.slice(-MAX_BUFFER);
      }

      if (
        typeof match === "string" ? buffer.includes(match) : match.test(buffer)
      ) {
        cleanup();
        resolve();
      }
    };

    const onExit = () => {
      cleanup();
      reject(new Error("process exited before log matched"));
    };

    const cleanup = () => {
      child.stdout?.off("data", onData);
      child.stderr?.off("data", onData);
      child.off("exit", onExit);
      clearTimeout(timer);
    };

    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.once("exit", onExit);

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("log readiness timeout"));
    }, timeout);
  });
}
