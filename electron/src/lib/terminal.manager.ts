import * as pty from "node-pty";

type Terminal = {
  id: string;
  process: pty.IPty;
};

export class TerminalManager {
  private terminals = new Map<string, Terminal>();

  create(folder: string): string {
    const id = `term-${crypto.randomUUID()}`;

    const shell = pty.spawn("bash", [], {
      name: "xterm-color",
      cwd: folder,
      env: process.env,
      cols: 80,
      rows: 24,
    });

    this.terminals.set(id, { id, process: shell });
    return id;
  }

  get(id: string): Terminal {
    return this.terminals.get(id)!;
  }

  run(command: string, id: string) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;

    terminal.process.write(command + "\r");
  }

  kill(id: string) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;

    terminal.process.kill();
    this.terminals.delete(id);
  }

  killAll() {
    for (const id of this.terminals.keys()) {
      this.kill(id);
    }
  }

  view(id: string, wc: Electron.WebContents) {
    const terminal = this.terminals.get(id);
    if (!terminal) return;
    terminal.process.onData((data) => {
      wc.send("terminal:data", {
        type: "task_stdout", // Crucial for your terminalsReducer switch statement
        terminalId: id,
        data: data,
      });
    });
  }
}
