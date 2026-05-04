import * as pty from "node-pty";
import stripAnsi from "strip-ansi";
import crypto from "crypto";
import { Task } from "../types/index.js";
import { getSystemStats } from "../utils/os.js";
import { EXIT_SENTINEL_PATTERN } from "../constants.js";

type Terminal = {
  id: string;
  process: pty.IPty;
};

function cleanChunk(chunk: string): string {
  return stripAnsi(chunk).replace(/\r/g, "");
}

function isNoise(line: string): boolean {
  return /^[⠙⠹⠸⠼⠴⠦⠧⠇⠏⠋]+$/.test(line.trim());
}

export class TerminalService {
  private terminals = new Map<string, Terminal>();
  private buffers = new Map<string, string[]>();
  private isReady = new Map<string, boolean>();
  private terminalToTask = new Map<string, string>();
  private logBuffers = new Map<string, string>();
  private platform = getSystemStats().platform;

  private getShell(): string {
    switch (this.platform) {
      case "win32":
        return "powershell.exe";
      case "darwin":
        return "/bin/zsh";
      case "linux":
        return "/bin/bash";
      default:
        return "bash";
    }
  }

  create(folder: string, wc: Electron.WebContents, task: Task): string {
    const id = `term-${crypto.randomUUID()}`;
    const shell = pty.spawn(this.getShell(), [], {
      name: "xterm-color",
      cwd: folder,
      env: process.env as any,
      cols: 80,
      rows: 24,
    });

    wc.send("terminal:created", {
      terminalId: id,
      name: task.task,
    });

    shell.onData((data) => {
      if (this.isReady.get(id)) {
        wc.send("terminal:data", { terminalId: id, data });
        this.handleLogChunk(data, wc, task);
      } else {
        const buffer = this.buffers.get(id) || [];
        buffer.push(data);
        this.buffers.set(id, buffer);
      }
    });

    this.terminalToTask.set(id, task.id);
    this.terminals.set(id, { id, process: shell });
    return id;
  }

  run(command: string, id: string) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;

    // Use the sentinel to detect completion
    terminal.process.write(
      `(${command}); EXIT_CODE=$?; echo "::TASK_EXIT:$EXIT_CODE::"\r`,
    );
  }

  write(id: string, data: string) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;
    terminal.process.write(data);
  }

  kill(id: string) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;

    terminal.process.kill();
    this.terminals.delete(id);
    this.isReady.delete(id);
    this.buffers.delete(id);
    this.terminalToTask.delete(id);
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
    if (!this.terminals.has(id)) return;

    this.isReady.set(id, true);

    const buffer = this.buffers.get(id) || [];
    if (buffer.length > 0) {
      wc.send("terminal:data", { terminalId: id, data: buffer.join("") });
      this.buffers.set(id, []);
    }
  }

  async listenForExitCode(id: string): Promise<number> {
    const terminal = this.terminals.get(id);
    if (!terminal) throw new Error(`Terminal with id ${id} not found`);

    return new Promise((resolve) => {
      let buffer = "";
      const handler = (data: string) => {
        buffer += data;
        const match = buffer.match(EXIT_SENTINEL_PATTERN);
        if (match) {
          resolve(Number(match[1]));
        }
      };
      terminal.process.onData(handler);
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
        reject(new Error("log readiness timeout"));
      }, timeout);

      const handler = (data: string) => {
        buffer += data;
        if (buffer.length > 5000) buffer = buffer.slice(-5000);

        const found = isRegEx
          ? safeRegex!.test(buffer)
          : buffer.includes(match as string);

        if (found) {
          clearTimeout(timer);
          resolve();
        }
      };

      terminal.process.onData(handler);
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
}
