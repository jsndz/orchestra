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
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* TABS - Tech-Noir Style */}
      <div className="flex items-center h-10 bg-black border-b border-border/20 px-0 overflow-x-auto">
        {terminalList.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`
              px-4 h-full text-[10px] font-mono tracking-widest uppercase flex items-center transition-none
              border-r border-border/10 relative
              ${
                activeId === t.id
                  ? "bg-card text-accent border-b-2 border-b-accent"
                  : "text-muted-foreground hover:bg-zinc-900 hover:text-foreground"
              }
            `}
          >
            {/* Terminal prefix icon */}
            <span className="mr-2 opacity-50">$</span>
            {t.name}
          </button>
        ))}
        {terminalList.length === 0 && (
          <div className="px-4 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest italic">
            // NO_ACTIVE_STREAMS
          </div>
        )}
      </div>

      {/* TERMINALS CONTAINER */}
      <div className="flex-1 relative bg-black">
        {terminalList.map((t) => (
          <div
            key={t.id}
            className={`
              absolute inset-0 
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