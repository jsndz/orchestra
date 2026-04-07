import * as pty from "node-pty";

type Terminal = {
  id: string;
  process: pty.IPty;
};

export class TerminalManager {
  private terminals = new Map<string, Terminal>();
  private buffers = new Map<string, string[]>();
  private isReady = new Map<string, boolean>();
  create(folder: string, wc: Electron.WebContents): string {
    const id = `term-${crypto.randomUUID()}`;
    console.log("new Terminal created", id);

    const shell = pty.spawn("bash", [], {
      name: "xterm-color",
      cwd: folder,
      env: process.env,
      cols: 80,
      rows: 24,
    });
    wc.send("terminal:created", {
      terminalId: id,
    });
    shell.onData((data) => {
      if (this.isReady.get(id)) {
        wc.send("terminal:data", { terminalId: id, data });
      } else {
        this.buffers.get(id)?.push(data);
      }
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
}
