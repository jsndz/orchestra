import { Events, TerminalUIState } from "../types";

type State = Record<string, TerminalUIState>;

export function terminalsReducer(state: State, event: Events): State {
  switch (event.type) {
    case "terminal_open": {
      const existing = state[event.terminalId];
      return {
        ...state,
        [event.terminalId]: {
          ...(existing ?? {}),
          terminalId: event.terminalId,
          taskId: event.taskId,
          status: "running",
          name: event.name,
        },
      };
    }

    case "task_started": {
      const existing = state[event.terminalId];
      return {
        ...state,
        [event.terminalId]: {
          ...(existing ?? {}),
          terminalId: event.terminalId,
          taskId: event.taskId,
          status: "running",
        },
      };
    }

    case "task_stdout":
    case "task_stderr": {
      const terminal = state[event.terminalId];
      if (!terminal) return state;

      return {
        ...state,
        [event.terminalId]: {
          ...terminal,
        },
      };
    }

    case "task_finished": {
      const terminal = state[event.terminalId];
      if (!terminal) return state;

      return {
        ...state,
        [event.terminalId]: {
          ...terminal,
          status: event.status,
        },
      };
    }

    default:
      return state;
  }
}
