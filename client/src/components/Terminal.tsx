import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

type Props = {
  terminalId: string;
  status: "running" | "success" | "failed";
  name: string;
};

export default function Terminal({ status, name, terminalId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      scrollback: 2000,
      convertEol: true,
      theme: { background: "#000000" },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitRef.current = fitAddon;

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });

    resizeObserver.observe(containerRef.current);
    term.onData((data)=>{
      window.api.sendTerminalInput(terminalId, data);
    })
    const unsubscribe = window.api.onExecutionEvent((msg) => {
      if (terminalId === msg.terminalId) {
        term.write(msg.data);
      }
    });

    window.api.terminalReady(terminalId);

    return () => {
      resizeObserver.disconnect();
      unsubscribe?.();
      term.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full rounded-lg overflow-hidden bg-black border border-zinc-700">
      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 text-xs text-zinc-300 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "running"
                ? "bg-yellow-400"
                : status === "success"
                ? "bg-green-400"
                : "bg-red-400"
            }`}
          />
          <span>{name}</span>
        </div>
      </div>

      {/* TERMINAL */}
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
}