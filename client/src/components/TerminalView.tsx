import { useEffect, useState } from "react";
import Terminal from "./Terminal";
import { useTerminalStore } from "../store/useTerminalStore";

export const TerminalPage = () => {
  const terminals = useTerminalStore((s) => s.terminals);
  const createTerminal = useTerminalStore((s) => s.createTerminal);

  const [activeId, setActiveId] = useState<string | null>(null);
 
  useEffect(() => {
    const unsubscribe = window.api.onTerminalCreated((config) => {
      if (!terminals[config.terminalId]) {
        createTerminal(config.terminalId, config.name);
        setActiveId(config.terminalId);
      }
    });

    return () => unsubscribe();
  }, [createTerminal, terminals]);

  const terminalList = Object.values(terminals);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* TABS */}
      <div className="flex items-center border-b bg-muted px-2 h-10 overflow-x-auto">
        {terminalList.map((t) => {
          return (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`px-3 py-1 text-sm rounded mr-2 whitespace-nowrap ${
                activeId === t.id
                  ? "bg-background border"
                  : "text-muted-foreground hover:bg-background/50"
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      {/* TERMINAL AREA */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {terminalList.map((t) => (
          <div
            key={t.id}
            className={`absolute inset-0 ${
              activeId === t.id ? "block" : "hidden"
            }`}
          >
            <div className="h-full w-full overflow-auto p-2">
              <Terminal terminalId={t.id} status="running" name={t.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
