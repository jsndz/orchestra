import { Task, Dependency, TaskRequest } from "../types";

type UpdateTaskPayload = Partial<
  Pick<Task, "task" | "folder" | "command" | "type" | "ready">
>;

export const fetchTasks = async (): Promise<{
  tasks: Task[];
  dependencies: Dependency[];
}> => {
  return await window.api.getTasks();
};

export const addTask = async (task: TaskRequest) => {
  return await window.api.createTask(task);
};

export const deleteTask = (id: string) => window.api.deleteTask(id);

export const updateTask = (id: string, updates: UpdateTaskPayload) =>
  window.api.updateTask(id, updates);

export const addDependency = (from: string, to: string) =>
  window.api.addDependency({ from, to });

export const deleteDependency = (from: string, to: string) =>
  window.api.removeDependency(from, to);

export const analyze = async (
  type: string,
  params?: { from?: string; to?: string },
) => {
  switch (type) {
    case "path":
      return await window.api.getPath(params?.from!, params?.to!);
    case "cycle":
      return await window.api.detectCycle();
    case "parallel":
      return await window.api.getParallel();
    case "terminal":
      return await window.api.getTerminal();
    case "unreachable":
      return await window.api.getUnreachable();
    default:
      throw new Error("Unsupported analysis type");
  }
};

export const execute = async () => {
  return window.api.startExecution();
};

export const stats = async () => {
  return await window.api.getSystemStats();
};

export const stopExecution = async () => {
  return await window.api.stopExecution();
};

export const uploadYaml = async (file: File) => {
  const text = await file.text();
  return await window.api.importYaml(text);
};

export const fetchLogs = async (taskId: string) => {
  return await window.api.getTaskLogs(taskId);
};

export const downloadYaml = async (workflowName: string) => {
  return await window.api.exportYaml(workflowName);
};
