import { TerminalManager } from "./terminal.manager";
import { Task } from "../store";

const terminalManager = new TerminalManager();

  export async function runCommand(task: Task) {
    const termId = terminalManager.create(task.folder);
    terminalManager.run(task.command, termId);
    terminalManager.view(termId);
  }

export function stopExecution() {
  terminalManager.killAll();
}

export function stopProcess(id: string) {
  terminalManager.kill(id);
}
