import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

export class TerminalInstance {
  id: string;
  term: Terminal;
  fitAddon: FitAddon;

  constructor(id: string, container: HTMLElement) {
    this.id = id;

    this.term = new Terminal({
      cursorBlink: true,
      scrollback: 2000,
      convertEol: true,
      theme: { background: "#000000" },
    });

    this.fitAddon = new FitAddon();
    this.term.loadAddon(this.fitAddon);

    this.term.open(container);
    this.fitAddon.fit();
  }

  write(data: string) {
    this.term.write(data);
  }

  resize() {
    this.fitAddon.fit();
  }

  dispose() {
    this.term.dispose();
  }
}