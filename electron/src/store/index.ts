import { Task, Dependency, GlobalExecutionState } from "../types/index.js";

export const tasks: Task[] = [];
export const dependencies: Dependency[] = [];

export let GlobalState: GlobalExecutionState = "idle";

export function setGlobalState(state: GlobalExecutionState) {
  GlobalState = state;
}
