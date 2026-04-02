// useTerminalStore.ts
import { create } from "zustand";

type TerminalMeta = {
  id: string;
  name: string;
  isActive: boolean;
};

type Store = {
  terminals: Record<string, TerminalMeta>;

  createTerminal: () => string;
  removeTerminal: (id: string) => void;
  setActive: (id: string) => void;
};

export const useTerminalStore = create<Store>((set, get) => ({
  terminals: {},

  createTerminal: () => {
    const id = crypto.randomUUID();

    set((state) => ({
      terminals: {
        ...state.terminals,
        [id]: {
          id,
          name: `Terminal ${Object.keys(state.terminals).length + 1}`,
          isActive: true,
        },
      },
    }));

    return id;
  },

  removeTerminal: (id) =>
    set((state) => {
      const updated = { ...state.terminals };
      delete updated[id];
      return { terminals: updated };
    }),

  setActive: (id) =>
    set((state) => ({
      terminals: Object.fromEntries(
        Object.entries(state.terminals).map(([key, t]) => [
          key,
          { ...t, isActive: key === id },
        ])
      ),
    })),
}));