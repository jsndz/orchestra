import { watch, FSWatcher } from "chokidar";
import { relative, sep } from "path";

export class FileWatcher {
  private watcher: FSWatcher | null = null;

  constructor(
    private readonly path: string,
    private readonly onchange: () => void,
  ) {}

  start() {
    this.watcher = watch(this.path, {
      ignored: (filePath: string) => {
        const rel = relative(this.path, filePath);
        const parts = rel.split(sep);
        return parts.some(
          (part) =>
            part === "node_modules" ||
            part === ".git" ||
            part === ".next" ||
            part === "dist" ||
            part === "build",
        );
      },
      ignoreInitial: true,
    });

    this.watcher.on("change", (filePath: string) => {
      this.onchange();
    });

    this.watcher.on("error", (error: unknown) => {
      console.error(`FileWatcher error on path ${this.path}:`, error);
    });
  }

  async close() {
    if (this.watcher) {
      try {
        await this.watcher.close();
      } catch (err) {
        console.error(`Error closing watcher on path ${this.path}:`, err);
      }
      this.watcher = null;
    }
  }
}
