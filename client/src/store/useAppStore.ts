import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StateCounts, StepState } from "../types";


type WorkflowState = {
  workflowName: string;
  setWorkflowName: (name: string) => void;
};

type taskCountState = {
  counts: StateCounts

  increment: (state: StepState) => void;
  decrement: (state: StepState) => void;

  updateState: (prev: StepState, next: StepState) => void;

  setInitialCounts: (counts: Partial<StateCounts>) => void;

}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      workflowName: "temp-workflow",
      setWorkflowName: (name) => set({ workflowName: name }),
    }),
    { name: "workflow-meta" },
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
