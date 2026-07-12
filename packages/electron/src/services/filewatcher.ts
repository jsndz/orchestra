import chokidar from "chokidar";
import { EventEmitter } from "events";

export class FileWatcher {
  constructor(
    private readonly path: string,
    private readonly onchange: () => void,
  ) {}

  start() {
    chokidar.watch(this.path).on("change", () => {
      this.onchange();
    });
  }
}
