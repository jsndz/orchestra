import { create } from "zustand";

export interface ResourceStats {
  cpu: number;    // %
  memory: number; // MB
}

interface ResourceState {
  resources: Record<string, ResourceStats>;
  setResources: (resources: Record<string, ResourceStats>) => void;
  clearResources: () => void;
}

export const useResourceStore = create<ResourceState>((set) => ({
  resources: {},
  setResources: (resources) => set({ resources }),
  clearResources: () => set({ resources: {} }),
}));
