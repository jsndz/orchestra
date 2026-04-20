import * as pty from "node-pty";
import stripAnsi from "strip-ansi";
import { Task } from "../store/index.js";
type Terminal = {
  id: string;
  process: pty.IPty;
};

function cleanChunk(chunk: string) {
  return stripAnsi(chunk).replace(/\r/g, "");
}
function isNoise(line: string) {
  return /^[⠙⠹⠸⠼⠴⠦⠧⠇⠏⠋]+$/.test(line.trim());
}
export class TerminalManager {
  private terminals = new Map<string, Terminal>();
  private buffers = new Map<string, string[]>();
  private isReady = new Map<string, boolean>();
  private terminalToTask = new Map<string, string>();
  create(folder: string, wc: Electron.WebContents, task: Task): string {
    const id = `term-${crypto.randomUUID()}`;
    const shell = pty.spawn("bash", [], {
      name: "xterm-color",
      cwd: folder,
      env: process.env,
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
        this.handleLogChunk(task.id, data, wc);
      } else {
        this.buffers.get(id)?.push(data);
      }
    });
    this.terminalToTask.set(id, task.id);

    this.terminals.set(id, { id, process: shell });
    return id;
  }

  get(id: string): Terminal {
    return this.terminals.get(id)!;
  }

  run(command: string, id: string) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;
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
  }
  getTaskIdByTerminalId(terminalId: string): string | undefined {
    return this.terminalToTask.get(terminalId);
  }
  killAll() {
    for (const id of this.terminals.keys()) {
      this.kill(id);
    }
  }

  setReady(id: string, wc: Electron.WebContents) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;

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

    return new Promise((resolve, reject) => {
      let buffer = "";

      const handler = (data: string) => {
        buffer += data;

        const match = buffer.match(/::TASK_EXIT:(\d+)::/);
        if (match) {
          const code = Number(match[1]);

          resolve(code);
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

      const handler = (data: string) => {
        buffer += data;

        if (buffer.length > 5000) {
          buffer = buffer.slice(-5000);
        }

        const matches = isRegEx
          ? safeRegex!.test(buffer)
          : buffer.includes(match as string);

        if (matches) {
          cleanup();
          resolve();
        }
      };

      const cleanup = () => {
        clearTimeout(timer);
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("log readiness timeout"));
      }, timeout);

      terminal.process.onData(handler);
    });
  }

  private logBuffers = new Map<string, string>();

  private handleLogChunk(id: string, chunk: string, wc: Electron.WebContents) {
    const cleaned = cleanChunk(chunk);

    const prev = this.logBuffers.get(id) || "";
    const combined = prev + cleaned;

    const lines = combined.split("\n");
    this.logBuffers.set(id, lines.pop() || "");

    for (const line of lines) {
      const clean = line.trim();
      if (!clean) continue;
      if (isNoise(clean)) continue;

      wc.send("task:log", {
        taskId: id,
        message: clean,
        ts: Date.now(),
      });
    }
  }
}
