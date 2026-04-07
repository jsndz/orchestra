import { TerminalManager } from "./terminal.manager";
import { Task } from "../store";

const terminalManager = new TerminalManager();

export async function runCommand(task: Task,wc:Electron.WebContents) {
  const termId = terminalManager.create(task.folder,wc);
  await terminalManager.run(task.command, termId);

}

export function stopExecution() {
  terminalManager.killAll();
}

export function stopProcess(id: string) {
  terminalManager.kill(id);
}

export function terminalReady(id: string,wc:Electron.WebContents) {
  terminalManager.setReady(id, wc);
}