import fs from "fs";
import path from "path";
import stripAnsi from "strip-ansi";
import { Task } from "@orchestra/shared";

/**
 * Handles workflow execution logs, parsing custom regex/string rules,
 * and writing stdout/stderr outputs to task-specific log files.
 */
export class TaskLogger {
  private logBuffers = new Map<string, string>();

  /**
   * Resets the task log file by creating the log directory if needed and truncating the file.
   */
  public resetLogFile(task: Task) {
    try {
      const logDir = path.join(task.folder, ".orchestra-logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, `${task.task}.log`);
      fs.writeFileSync(logFile, "");
    } catch (e) {
      console.error("Failed to reset task log file", e);
    }
  }

  /**
   * Appends raw output (stripped of ANSI escape codes) to the task-specific log file.
   */
  public writeLogToFile(task: Task, data: string) {
    try {
      const cleanData = stripAnsi(data);
      if (!cleanData) return;
      const logDir = path.join(task.folder, ".orchestra-logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, `${task.task}.log`);
      fs.appendFileSync(logFile, cleanData);
    } catch (e) {
      console.error("Failed to write task log to file", e);
    }
  }

  /**
   * Processes a chunk of terminal output, extracts completed lines, and checks them against active log rules.
   */
  public processLogChunk(
    task: Task,
    chunk: string,
    onLineMatch: (line: string, rule?: any) => void
  ) {
    const cleaned = stripAnsi(chunk).replace(/\r/g, "");
    const prev = this.logBuffers.get(task.id) || "";
    const combined = prev + cleaned;
    const lines = combined.split("\n");

    this.logBuffers.set(task.id, lines.pop() || "");

    const rules = task.logRules?.filter((r) => r.enabled) ?? [];
    const noiseRegex = /^[⠙⠹⠸⠼⠴⠦⠧⠇⠏⠋]+$/;

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine || noiseRegex.test(cleanLine)) continue;

      if (rules.length === 0) {
        onLineMatch(cleanLine);
        continue;
      }

      let matched = false;
      for (const rule of rules) {
        if (this.matchRule(cleanLine, rule)) {
          onLineMatch(cleanLine, rule);
          matched = true;
          break;
        }
      }

      if (!matched) {
        onLineMatch(cleanLine);
      }
    }
  }

  private matchRule(line: string, rule: any): boolean {
    if (rule.isRegex) {
      const regex = rule.match instanceof RegExp ? rule.match : new RegExp(rule.match);
      return regex.test(line);
    }
    return line.includes(String(rule.match));
  }
}
