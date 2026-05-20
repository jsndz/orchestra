import * as pty from "node-pty";
import stripAnsi from "strip-ansi";
import crypto from "crypto";
import { Task } from "../types/index.js";
import { getSystemStats } from "../utils/os.js";
import {
  EXIT_SENTINEL_PATTERN,
  EXIT_SENTINEL_PREFIX,
  START_SENTINEL,
} from "../constants.js";

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

/**
 * Creates a regex that matches a string even if it has ANSI escape sequences between characters.
 */
function createMarkerRegex(str: string): RegExp {
  const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped.split("").join("(?:\\x1b\\[[0-9;]*m)*");
  return new RegExp(pattern);
}

export class TerminalService {
  private terminals = new Map<string, Terminal>();
  private buffers = new Map<string, string[]>();
  private isReady = new Map<string, boolean>();
  private terminalToTask = new Map<string, string>();
  private logBuffers = new Map<string, string>();
  private platform = getSystemStats().platform;

  private filteringStates = new Map<string, "hiding" | "showing" | "idle">();
  private parseBuffers = new Map<string, string>();
  private exitCodeResolvers = new Map<string, (code: number) => void>();

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
      let state = this.filteringStates.get(id) || "idle";

      if (state === "hiding") {
        const buffer = (this.parseBuffers.get(id) || "") + data;
        const markerRegex = createMarkerRegex(START_SENTINEL);
        const match = buffer.match(markerRegex);

        if (match) {
          this.filteringStates.set(id, "showing");
          const endOfMatch = (match.index || 0) + match[0].length;
          let remaining = buffer.slice(endOfMatch);
          // Strip leading newline
          remaining = remaining.replace(/^(\r\n|\n|\r)/, "");
          this.parseBuffers.set(id, "");
          if (remaining.length > 0) {
            this.processTerminalData(id, remaining, wc, task);
          }
        } else {
          // Keep only the end of the buffer to avoid missing split markers,
          // but limit growth to prevent memory issues if marker is never seen.
          const maxKeep = START_SENTINEL.length * 2;
          this.parseBuffers.set(id, buffer.slice(-maxKeep));
        }
        return;
      }

      if (state === "showing") {
        const buffer = (this.parseBuffers.get(id) || "") + data;
        const exitMatch = buffer.match(EXIT_SENTINEL_PATTERN);

        if (exitMatch) {
          const exitIdx = buffer.indexOf(exitMatch[0]);
          const beforeExit = buffer.slice(0, exitIdx);
          if (beforeExit.length > 0) {
            this.processTerminalData(id, beforeExit, wc, task);
          }

          const code = parseInt(exitMatch[1], 10);
          const resolver = this.exitCodeResolvers.get(id);
          if (resolver) {
            resolver(code);
            this.exitCodeResolvers.delete(id);
          }

          this.filteringStates.set(id, "idle");
          this.parseBuffers.set(id, "");
          
          // Process any trailing data after the exit sentinel (like a prompt)
          const afterExit = buffer.slice(exitIdx + exitMatch[0].length);
          if (afterExit.length > 0) {
            this.processTerminalData(id, afterExit, wc, task);
          }
        } else {
          // Send data immediately unless it might be the start of a sentinel.
          // Sentinels start with '::'.
          const lastMarkerStart = buffer.lastIndexOf("::");
          if (lastMarkerStart !== -1) {
            const toSend = buffer.slice(0, lastMarkerStart);
            const toKeep = buffer.slice(lastMarkerStart);
            
            if (toSend.length > 0) {
              this.processTerminalData(id, toSend, wc, task);
            }
            
            // If the potential sentinel buffer grows too long without matching,
            // it's likely normal output, so flush most of it.
            if (toKeep.length > 128) {
              this.processTerminalData(id, toKeep.slice(0, -64), wc, task);
              this.parseBuffers.set(id, toKeep.slice(-64));
            } else {
              this.parseBuffers.set(id, toKeep);
            }
          } else {
            // No marker start found, but check for split '::' (ends with ':')
            if (buffer.endsWith(":")) {
              const toSend = buffer.slice(0, -1);
              if (toSend.length > 0) this.processTerminalData(id, toSend, wc, task);
              this.parseBuffers.set(id, ":");
            } else {
              this.processTerminalData(id, buffer, wc, task);
              this.parseBuffers.set(id, "");
            }
          }
        }
        return;
      }

      this.processTerminalData(id, data, wc, task);
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
    if (this.isReady.get(id)) {
      if (data.length > 0) {
        wc.send("terminal:data", {
          terminalId: id,
          data: data,
        });
      }
      this.handleLogChunk(data, wc, task);
    } else {
      const buffer = this.buffers.get(id) || [];
      buffer.push(data);
      this.buffers.set(id, buffer);
    }
  }

  run(command: string, id: string) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;

    this.filteringStates.set(id, "hiding");
    this.parseBuffers.set(id, "");

    // Emit a clean command echo to the UI (Styled as a green prompt)
    terminal.wc.send("terminal:data", {
      terminalId: id,
      data: `\x1b[1;32m$ ${command}\x1b[0m\r\n`,
    });

    const wrappedCommand =
      this.platform === "win32"
        ? `Write-Output ("::TASK_" + "START::"); ${command}; if ($null -eq $LASTEXITCODE) { $EXIT_CODE = 0 } else { $EXIT_CODE = $LASTEXITCODE }; Write-Output ("::TASK_EXIT:" + $EXIT_CODE + "::")\r`
        : `{ printf "::TASK_"; printf "START::\\n"; ${command}; } ; EXIT_CODE=$?; printf "::TASK_EXIT:%%s::\\n" "$EXIT_CODE"\r`;

    terminal.process.write(wrappedCommand);
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
    this.filteringStates.delete(id);
    this.parseBuffers.delete(id);
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
    if (!this.terminals.has(id)) return;

    this.isReady.set(id, true);

    const buffer = this.buffers.get(id) || [];
    if (buffer.length > 0) {
      wc.send("terminal:data", { terminalId: id, data: buffer.join("") });
      this.buffers.set(id, []);
    }
  }

  async listenForExitCode(id: string): Promise<number> {
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
}
