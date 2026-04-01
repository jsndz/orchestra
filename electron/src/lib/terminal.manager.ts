import { ChildProcess, spawn } from "child_process";

type Terminal = {
  id: string;
  process: ChildProcess;
};

export class TerminalManager {
  private terminals = new Map<string, Terminal>();
  create(folder: string): string {
    const id = `term-${crypto.randomUUID()}`;
    const shell = spawn("bash", [], {
      stdio: "pipe",
      cwd: folder,
      shell: true,
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
    terminal.process.stdin?.write(command + "\n");
  }
  kill(id: string) {
    this.terminals.get(id)?.process.kill();
    this.terminals.delete(id);
  }
  killAll() {
    for (const id of this.terminals.keys()) {
      this.kill(id);
    }
  }
  view(id: string) {
    const terminal = this.terminals.get(id);
    terminal?.process.stdout?.on("data",(stream)=>{
      console.log(stream.toString());
    })
  }
}
