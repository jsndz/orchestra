import { TaskRequest, Dependency, Task } from "@orchestra/shared";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTaskRequest(body: Partial<TaskRequest>): ValidationResult {
  const errors: string[] = [];

  if (!body.task || typeof body.task !== "string" || !body.task.trim()) {
    errors.push("Task name ('task') is required and must be a non-empty string.");
  }

  if (!body.command || typeof body.command !== "string" || !body.command.trim()) {
    errors.push("Task command ('command') is required and must be a non-empty string.");
  }

  if (!body.folder || typeof body.folder !== "string" || !body.folder.trim()) {
    errors.push("Task folder ('folder') is required and must be a non-empty string.");
  }

  if (!body.type || !["job", "service"].includes(body.type)) {
    errors.push("Task type ('type') must be either 'job' or 'service'.");
  }

  if (body.ready) {
    if (!["exit", "port", "log", "http"].includes(body.ready.kind)) {
      errors.push("Ready condition kind must be one of: 'exit', 'port', 'log', 'http'.");
    } else if (body.ready.kind === "port") {
      if (typeof body.ready.port !== "number" || body.ready.port <= 0 || body.ready.port > 65535) {
        errors.push("Ready port must be a number between 1 and 65535.");
      }
    } else if (body.ready.kind === "log") {
      if (!body.ready.match) {
        errors.push("Ready log match pattern is required when kind is 'log'.");
      }
    } else if (body.ready.kind === "http") {
      if (!body.ready.url || typeof body.ready.url !== "string") {
        errors.push("Ready HTTP URL is required when kind is 'http'.");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateDependency(
  from: string,
  to: string,
  existingTasks: Task[]
): ValidationResult {
  const errors: string[] = [];

  if (!from || !to) {
    errors.push("Dependency requires both 'from' and 'to' task IDs.");
  }

  if (from === to) {
    errors.push("A task cannot depend on itself.");
  }

  const fromExists = existingTasks.some((t) => t.id === from || t.task === from);
  const toExists = existingTasks.some((t) => t.id === to || t.task === to);

  if (!fromExists) {
    errors.push(`Prerequisite task '${from}' does not exist.`);
  }
  if (!toExists) {
    errors.push(`Target task '${to}' does not exist.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
