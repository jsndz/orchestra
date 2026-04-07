import { useEffect } from "react";
import Terminal from "./Terminal";
import { useTerminalStore } from "../store/useTerminalStore";
export const TerminalPage = () => {
  const terminals = useTerminalStore((s) => s.terminals);
  const createTerminal = useTerminalStore((s) => s.createTerminal);

  useEffect(() => {
    const unsubscribe = window.api.onTerminalCreated((config) => {
      if (!terminals[config.terminalId]) {
        createTerminal(config.terminalId);
      }
    });

    return () => unsubscribe(); 
  }, [createTerminal, terminals]);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto h-full">
      {Object.values(terminals).map((terminal) => (
        <Terminal
          key={terminal.id}
          terminalId={terminal.id}
          status="running"
          name={terminal.name}
        />
      ))}
    </div>
  );
};