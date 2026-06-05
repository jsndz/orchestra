import * as pty from "node-pty";
import stripAnsi from "strip-ansi";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Task } from "../types/index.js";
import { getSystemStats } from "../utils/os.js";
import { tasks } from "../store/index.js";

type Terminal = {
  id: string;
  process: pty.IPty;
  wc: Electron.WebContents;
};

function cleanChunk(chunk: string): string {
  return stripAnsi(chunk).replace(/\r/g, "");
}

function isNoise(line: string): boolean {
  return /^[⠙⠹⠸⠼⠴⠦⠧⠇⠏⠋]+$/.test(line.trim());
}

export class TerminalService {
  private terminals = new Map<string, Terminal>();
  private historyBuffers = new Map<string, string[]>();
  private isReady = new Map<string, boolean>();
  private terminalToTask = new Map<string, string>();
  private logBuffers = new Map<string, string>();
  private platform = getSystemStats().platform;

  private exitCodeResolvers = new Map<string, (code: number) => void>();
  private exitCodes = new Map<string, number>();

  private getShell(): string {
    switch (this.platform) {
      case "win32":
        return "powershell.exe";
      case "darwin":
        return "/bin/zsh";
      case "linux":
        return "/bin/bash";
      default:
        return "/bin/sh";
    }
  }

  private getShellArgs(command: string): string[] {
    switch (this.platform) {
      case "win32":
        return ["-Command", command];
      default:
        return ["-c", command];
    }
  }

  clearAll() {
    this.killAll();
    this.historyBuffers.clear();
    this.exitCodes.clear();
  }

  create(folder: string, wc: Electron.WebContents, task: Task): string {
    this.resetLogFile(task);
    const id = `term-${crypto.randomUUID()}`;
    const shell = pty.spawn(this.getShell(), this.getShellArgs(task.command), {
      name: "xterm-color",
      cwd: folder,
      env: Object.assign({}, process.env, task.env) as any,
      cols: 80,
      rows: 24,
    });

    wc.send("terminal:created", {
      terminalId: id,
      name: task.task,
    });

    shell.onData((data) => {
      this.processTerminalData(id, data, wc, task);
    });

    shell.onExit(({ exitCode }) => {
      const resolver = this.exitCodeResolvers.get(id);
      if (resolver) {
        resolver(exitCode);
        this.exitCodeResolvers.delete(id);
      } else {
        this.exitCodes.set(id, exitCode);
      }
    });

    this.terminalToTask.set(id, task.id);
    this.terminals.set(id, { id, process: shell, wc });
    return id;
  }

  private processTerminalData(
    id: string,
    data: string,
    wc: Electron.WebContents,
    task: Task,
  ) {
    const history = this.historyBuffers.get(id) || [];
    history.push(data);
    this.historyBuffers.set(id, history);

    if (data.length > 0) {
      this.writeLogToFile(task, data);
      if (this.isReady.get(id)) {
        wc.send("terminal:data", {
          terminalId: id,
          data: data,
        });
      }
    }
    this.handleLogChunk(data, wc, task);
  }

  injectSystemLog(id: string, data: string) {
    const history = this.historyBuffers.get(id) || [];
    history.push(data);
    this.historyBuffers.set(id, history);

    const taskId = this.terminalToTask.get(id);
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        this.writeLogToFile(task, data);
      }
    }

    const terminal = this.terminals.get(id);
    if (terminal && this.isReady.get(id)) {
      terminal.wc.send("terminal:data", {
        terminalId: id,
        data: data,
      });
    }
  }

  run(command: string, id: string) {
    const echoData = `\x1b[1;32m$ ${command}\x1b[0m\r\n`;
    this.injectSystemLog(id, echoData);
  }

  write(id: string, data: string) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;
    try {
      terminal.process.write(data);
    } catch (e) {
      console.error("Failed to write to terminal process", e);
    }
  }

  kill(id: string) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;

    try {
      terminal.process.kill();
    } catch (e) {
      console.error("Failed to kill terminal process", e);
    }
    this.terminals.delete(id);
    this.isReady.delete(id);
    this.terminalToTask.delete(id);
    this.exitCodeResolvers.delete(id);
  }

  killAll() {
    for (const id of this.terminals.keys()) {
      this.kill(id);
    }
  }

  getTaskIdByTerminalId(terminalId: string): string | undefined {
    return this.terminalToTask.get(terminalId);
  }

  setReady(id: string, wc: Electron.WebContents) {
    if (!this.terminals.has(id) && !this.historyBuffers.has(id)) return;

    this.isReady.set(id, true);

    const history = this.historyBuffers.get(id) || [];
    if (history.length > 0) {
      wc.send("terminal:data", { terminalId: id, data: history.join("") });
    }
  }

  async listenForExitCode(id: string): Promise<number> {
    if (this.exitCodes.has(id)) {
      const code = this.exitCodes.get(id)!;
      this.exitCodes.delete(id);
      return code;
    }
    return new Promise((resolve) => {
      this.exitCodeResolvers.set(id, resolve);
    });
  }

  async listenForLog(
    id: string,
    match: string | RegExp,
    isRegEx: boolean,
    timeout = 30000,
  ): Promise<void> {
    const terminal = this.terminals.get(id);
    if (!terminal) throw new Error(`Terminal with id ${id} not found`);

    return new Promise((resolve, reject) => {
      let buffer = "";

      const safeRegex =
        isRegEx && match instanceof RegExp
          ? new RegExp(match.source, match.flags.replace("g", ""))
          : null;

      const timer = setTimeout(() => {
        disposable.dispose();
        reject(new Error("log readiness timeout"));
      }, timeout);

      const disposable = terminal.process.onData((data: string) => {
        buffer += data;

        if (buffer.length > 5000) {
          buffer = buffer.slice(-5000);
        }

        const found = isRegEx
          ? safeRegex!.test(buffer)
          : buffer.includes(match as string);

        if (found) {
          clearTimeout(timer);
          disposable.dispose();
          resolve();
        }
      });
    });
  }

  private handleLogChunk(chunk: string, wc: Electron.WebContents, task: Task) {
    const cleaned = cleanChunk(chunk);
    const prev = this.logBuffers.get(task.id) || "";
    const combined = prev + cleaned;
    const lines = combined.split("\n");

    this.logBuffers.set(task.id, lines.pop() || "");

    const rules = task.logRules?.filter((r) => r.enabled) ?? [];

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine || isNoise(cleanLine)) continue;

      if (rules.length === 0) {
        this.sendLog(wc, task.id, cleanLine);
        continue;
      }

      for (const rule of rules) {
        if (this.matchRule(cleanLine, rule)) {
          this.sendLog(wc, task.id, cleanLine, rule);
          break;
        }
      }
    }
  }

  private matchRule(line: string, rule: any): boolean {
    if (rule.isRegex) {
      const regex =
        rule.match instanceof RegExp ? rule.match : new RegExp(rule.match);
      return regex.test(line);
    }
    return line.includes(String(rule.match));
  }

  private sendLog(
    wc: Electron.WebContents,
    taskId: string,
    message: string,
    rule?: any,
  ) {
    wc.send("task:log", {
      taskId,
      message,
      ts: Date.now(),
      ...(rule && {
        color: rule.color,
        ruleId: rule.id,
        label: rule.label,
      }),
    });
  }

  private resetLogFile(task: Task) {
    try {
      const logDir = path.join(task.folder, ".orchestra-logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, `${task.task}.log`);
      fs.writeFileSync(logFile, "");
    } catch (e) {
      console.error("Failed to reset task log file", e);
    }
  }

  private writeLogToFile(task: Task, data: string) {
    try {
      const cleanData = stripAnsi(data);
      if (!cleanData) return;
      const logDir = path.join(task.folder, ".orchestra-logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, `${task.task}.log`);
      fs.appendFileSync(logFile, cleanData);
    } catch (e) {
      console.error("Failed to write task log to file", e);
    }
  }
}
