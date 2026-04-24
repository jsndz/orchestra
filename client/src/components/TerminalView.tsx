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
      <div className="flex items-center h-9 bg-zinc-900 border-b border-zinc-800 px-1 overflow-x-auto">
        {terminalList.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`
              px-3 h-8 text-xs flex items-center
              border-r border-zinc-800
              ${
                activeId === t.id
                  ? "bg-black text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }
            `}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* TERMINALS */}
      <div className="flex-1 relative bg-black">
        {terminalList.map((t) => (
          <div
            key={t.id}
            className={`
              absolute inset-0 transition-opacity
              ${
                activeId === t.id
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none" 
              }
            `}
          >
            <Terminal
              terminalId={t.id}
              status="running"
              name={t.name}
              isActive={activeId === t.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};