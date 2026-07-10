import * as pty from "node-pty";
import crypto from "crypto";
import { Task } from "@orchestra/shared";
import { getSystemStats } from "../../utils/os.js";

type Terminal = {
  id: string;
  process: pty.IPty;
};

/**
 * High-performance service wrapping low-level terminal process management (via node-pty).
 * Fully decoupled from Electron window contexts or UI logging systems.
 */
export class TerminalService {
  private terminals = new Map<string, Terminal>();
  private historyBuffers = new Map<string, string[]>();
  private isReady = new Map<string, boolean>();
  private terminalToTask = new Map<string, string>();
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

  /**
   * Resets and cleans up all active processes and history buffers.
   */
  public clearAll() {
    this.killAll();
    this.historyBuffers.clear();
    this.exitCodes.clear();
  }

  /**
   * Spawns a new virtual terminal shell running the specified task command.
   */
  public create(
    folder: string,
    task: Task,
    onCreated: (terminalId: string, name: string) => void,
    onData: (terminalId: string, data: string) => void,
    onExit: (terminalId: string, exitCode: number) => void
  ): string {
    const id = `term-${crypto.randomUUID()}`;
    const shell = pty.spawn(this.getShell(), this.getShellArgs(task.command), {
      name: "xterm-color",
      cwd: folder,
      env: Object.assign({}, process.env, task.env) as any,
      cols: 80,
      rows: 24,
    });

    onCreated(id, task.task);

    shell.onData((data) => {
      const history = this.historyBuffers.get(id) || [];
      history.push(data);
      this.historyBuffers.set(id, history);

      onData(id, data);
    });

    shell.onExit(({ exitCode }) => {
      const resolver = this.exitCodeResolvers.get(id);
      if (resolver) {
        resolver(exitCode);
        this.exitCodeResolvers.delete(id);
      } else {
        this.exitCodes.set(id, exitCode);
      }
      onExit(id, exitCode);
    });

    this.terminalToTask.set(id, task.id);
    this.terminals.set(id, { id, process: shell });
    return id;
  }

  /**
   * Injects system-level log messages into the terminal output stream and history.
   */
  public injectSystemLog(
    id: string,
    data: string,
    onDataCallback: (id: string, data: string) => void
  ) {
    const history = this.historyBuffers.get(id) || [];
    history.push(data);
    this.historyBuffers.set(id, history);
    onDataCallback(id, data);
  }

  /**
   * Outputs the echo command prompt to screen.
   */
  public run(command: string, id: string, onDataCallback: (id: string, data: string) => void) {
    const echoData = `\x1b[1;32m$ ${command}\x1b[0m\r\n`;
    this.injectSystemLog(id, echoData, onDataCallback);
  }

  /**
   * Writes stdin data to the active virtual terminal process.
   */
  public write(id: string, data: string) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;
    try {
      terminal.process.write(data);
    } catch (e) {
      console.error("Failed to write to terminal process", e);
    }
  }

  /**
   * Terminates a specific terminal process.
   */
  public kill(id: string) {
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

  /**
   * Terminates all running terminal processes.
   */
  public killAll() {
    for (const id of this.terminals.keys()) {
      this.kill(id);
    }
  }

  /**
   * Gets the taskId mapped to a given terminalId.
   */
  public getTaskIdByTerminalId(terminalId: string): string | undefined {
    return this.terminalToTask.get(terminalId);
  }

  /**
   * Gets all active terminal processes with their corresponding taskIds and PIDs.
   */
  public getActiveProcesses(): { taskId: string; pid: number }[] {
    const list: { taskId: string; pid: number }[] = [];
    for (const [termId, terminal] of this.terminals.entries()) {
      const taskId = this.terminalToTask.get(termId);
      if (taskId) {
        list.push({ taskId, pid: terminal.process.pid });
      }
    }
    return list;
  }

  /**
   * Marks a terminal ready to receive and flushes its history buffer to the client.
   */
  public setReady(id: string, onDataCallback: (id: string, data: string) => void) {
    if (!this.terminals.has(id) && !this.historyBuffers.has(id)) return;

    this.isReady.set(id, true);

    const history = this.historyBuffers.get(id) || [];
    if (history.length > 0) {
      onDataCallback(id, history.join(""));
    }
  }

  /**
   * Resolves a promise when the process exits.
   */
  public async listenForExitCode(id: string): Promise<number> {
    if (this.exitCodes.has(id)) {
      const code = this.exitCodes.get(id)!;
      this.exitCodes.delete(id);
      return code;
    }
    return new Promise((resolve) => {
      this.exitCodeResolvers.set(id, resolve);
    });
  }

  /**
   * Resolves a promise when the terminal stdout stream contains the specified match.
   */
  public async listenForLog(
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
          ? (safeRegex ? safeRegex.test(buffer) : new RegExp(match).test(buffer))
          : buffer.includes(match as string);

        if (found) {
          clearTimeout(timer);
          disposable.dispose();
          resolve();
        }
      });
    });
  }

  /**
   * Checks if a terminal has been marked as ready by the client.
   */
  public isTerminalReady(id: string): boolean {
    return !!this.isReady.get(id);
  }
}
