import { TerminalInstance } from "./terminalInstance";

class TerminalService {
  private instances = new Map<string, TerminalInstance>();
  private buffers: Map<string, string[]> = new Map();
  create(id: string, container: HTMLElement) {
    if (this.instances.has(id)) return;

    const instance = new TerminalInstance(id, container);
    this.instances.set(id, instance);
    // if(this.buffers.has(id)){
    //   this.buffers.get(id)?.forEach(data => {
    //     instance.term.write(data);
    //   });
    //   this.buffers.delete(id);
    // }

  }

  write(id: string, data: string) {
    const term = this.instances.get(id);
    // if (term) {
      term?.write(data);
    // } else {
    //   const buffer = this.buffers.get(id) || [];
    //   buffer.push(data);
    //   this.buffers.set(id, buffer);
    // }

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
