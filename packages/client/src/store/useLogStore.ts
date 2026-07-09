import { create } from "zustand";

export interface LogEntry {
  taskId: string;
  message: string;
  ts: number;
  color?: string;
  ruleId?: string;
  label?: string;
}

interface LogStore {
  logs: LogEntry[];
  logsMap: Record<string, LogEntry[]>;
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
  logs: [],
  logsMap: {},
  addLog: (log) =>
    set((state) => {
      const taskLogs = state.logsMap[log.taskId] || [];
      return {
        logs: [...state.logs, log].slice(-5000), // Buffer of last 5000 logs globally
        logsMap: {
          ...state.logsMap,
          [log.taskId]: [...taskLogs, log].slice(-2000), // Buffer of last 2000 logs per task
        },
      };
    }),
  clearLogs: () => set({ logs: [], logsMap: {} }),
}));
