import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StateCounts, StepState } from "@/types";

export type RecentWorkflow = {
  id: string;
  name: string;
  path: string;
  taskCount: number;
  lastRun: string;
  status: "success" | "failed" | "idle" | "running";
};

type WorkflowState = {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  recentWorkflows: RecentWorkflow[];
  addRecentWorkflow: (wf: Partial<RecentWorkflow> & { name: string }) => void;
};

type taskCountState = {
  counts: StateCounts;

  increment: (state: StepState) => void;
  decrement: (state: StepState) => void;

  updateState: (prev: StepState, next: StepState) => void;

  setInitialCounts: (counts: Partial<StateCounts>) => void;
};

const DUMMY_WORKFLOW_NAMES = ["microservices-dev.yaml", "ci-test-pipeline.yaml", "data-etl-sync.yaml", "wf-1", "wf-2", "wf-3"];

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      workflowName: "temp-workflow",
      setWorkflowName: (name) => set({ workflowName: name }),
      recentWorkflows: [],
      addRecentWorkflow: (wf) =>
        set((state) => {
          const newEntry: RecentWorkflow = {
            id: `wf-${Date.now()}`,
            name: wf.name,
            path: wf.path || `./${wf.name}`,
            taskCount: wf.taskCount || 1,
            lastRun: wf.lastRun || "Just now",
            status: wf.status || "idle",
          };
          const filtered = (state.recentWorkflows || []).filter(
            (item) => item.name !== wf.name && !DUMMY_WORKFLOW_NAMES.includes(item.name) && !DUMMY_WORKFLOW_NAMES.includes(item.id)
          );
          return {
            recentWorkflows: [newEntry, ...filtered].slice(0, 10),
          };
        }),
    }),
    {
      name: "workflow-meta-v2",
      migrate: (persistedState: any) => {
        if (persistedState && Array.isArray(persistedState.recentWorkflows)) {
          persistedState.recentWorkflows = persistedState.recentWorkflows.filter(
            (item: any) => !DUMMY_WORKFLOW_NAMES.includes(item.name) && !DUMMY_WORKFLOW_NAMES.includes(item.id)
          );
        }
        return persistedState;
      },
      version: 2,
    },
  ),
);

export const useStepMetricsStore = create<taskCountState>((set) => ({
  counts: {
    idle: 0,
    starting: 0,
    ready: 0,
    running: 0,
    completed: 0,
    failed: 0,
    stopped: 0,
  },

  increment: (state) =>
    set((s) => ({
      counts: { ...s.counts, [state]: s.counts[state] + 1 },
    })),

  decrement: (state) =>
    set((s) => ({
      counts: { ...s.counts, [state]: Math.max(0, s.counts[state] - 1) },
    })),

  updateState: (prev, next) =>
    set((s) => ({
      counts: {
        ...s.counts,
        [prev]: Math.max(0, s.counts[prev] - 1),
        [next]: s.counts[next] + 1,
      },
    })),

  setInitialCounts: (counts) =>
    set((s) => ({
      counts: { ...s.counts, ...counts },
    })),
}));
