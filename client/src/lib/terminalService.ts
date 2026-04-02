import { TerminalInstance } from "./terminalInstance";

class TerminalService {
  private instances = new Map<string, TerminalInstance>();

  create(id: string, container: HTMLElement) {
    if (this.instances.has(id)) return;

    const instance = new TerminalInstance(id, container);
    this.instances.set(id, instance);
  }

  write(id: string, data: string) {
    this.instances.get(id)?.write(data);
  }

  resize(id: string) {
    this.instances.get(id)?.resize();
  }

  dispose(id: string) {
    this.instances.get(id)?.dispose();
    this.instances.delete(id);
  }
}

export const terminalService = new TerminalService();