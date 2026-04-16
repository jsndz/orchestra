import { create } from "zustand";

type TerminalMeta = {
  id: string;
  name: string;
  isActive: boolean;
};

type Store = {
  terminals: Record<string, TerminalMeta>;

  createTerminal: (id: string,name:string) => string;
  removeTerminal: (id: string) => void;
  setActive: (id: string) => void;
};

export const useTerminalStore = create<Store>((set, get) => ({
  terminals: {},
  createTerminal: (id: string,name:string) => {
  set((state) => {
    if (state.terminals[id]) return state;

    return {
      terminals: {
        ...state.terminals,
        [id]: {
          id,
          name: name,
          isActive: true,
        },
      },
    };
  });
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
        ]),
      ),
    })),
}));
