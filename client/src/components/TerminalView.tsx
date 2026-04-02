import { useEffect } from "react";
import { useTerminalEvents } from "../hooks/useTerminalEvents";
import { useTerminalStore } from "../store/useTerminalStore";
import Terminal from "./Terminal";

export const TerminalPage = () => {
  useTerminalEvents();

  const terminals = useTerminalStore((s) => s.terminals);
  const createTerminal = useTerminalStore((s) => s.createTerminal);

  useEffect(() => {
    if (Object.keys(terminals).length === 0) {
      createTerminal();
    }
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-auto">
      {Object.values(terminals).map((t) => (
        <Terminal
          key={t.id}
          terminalId={t.id}
          name={t.name}
          status="running"
        />
      ))}
    </div>
  );
};