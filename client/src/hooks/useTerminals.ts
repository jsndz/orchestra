import { useEffect, useReducer, useRef } from "react";
import { terminalsReducer } from "../config/handleSSE";
import { Events, TerminalUIState } from "../types";
import { Terminal as XTerm } from "@xterm/xterm";
import { useQueryClient } from "@tanstack/react-query";

export function useTerminals() {
  const [state, dispatch] = useReducer(
    terminalsReducer,
    {} as Record<string, TerminalUIState>,
  );
  const queryClient = useQueryClient();
  const terminalMap = useRef<Record<string, XTerm>>({});

  useEffect(() => {
    const unsubscribe = window.api.onExecutionEvent((msg: Events) => {
      dispatch(msg);

      const term = terminalMap.current[msg.terminalId];

      if (!term) {
        return;
      }
      console.log(msg);

      switch (msg.type) {
        case "task_stdout":
        case "task_stderr":
          term.write(msg.data);
          break;

        case "task_started":
          term.write(`\r\n$ ${msg.command}\r\n`);
          break;

        case "task_state":
          queryClient.setQueryData(["tasks"], (old: any) => {
            if (!old) return old;

            return {
              ...old,
              tasks: old.tasks.map((t: any) =>
                t.id === msg.taskId ? { ...t, state: msg.state } : t,
              ),
            };
          });
          break;
      }
    });

    return () => unsubscribe?.();
  }, [queryClient]);

  return {
    state,

    registerTerminal: (id: string, term: XTerm) => {
      terminalMap.current[id] = term;
    },
  };
}
