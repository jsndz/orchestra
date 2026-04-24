import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

type Props = {
  terminalId: string;
  status: "running" | "success" | "failed";
  name: string;
  isActive: boolean;
};

export default function Terminal({
  status,
  name,
  terminalId,
  isActive,
}: Props) {
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

    // delay fit (important)
    setTimeout(() => fitAddon.fit(), 0);

    termRef.current = term;
    fitRef.current = fitAddon;

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });

    resizeObserver.observe(containerRef.current);

    term.onData((data) => {
      window.api.sendTerminalInput(terminalId, data);
    });

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

  // refit when tab becomes active
  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        fitRef.current?.fit();
      }, 0);
    }
  }, [isActive]);

  return (
    <div className="flex flex-col h-full w-full bg-black">
      {/* HEADER */}
      <div className="flex items-center px-3 py-1 bg-zinc-900 border-b border-zinc-800 text-xs">
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
          <span className="text-zinc-300">{name}</span>
        </div>
      </div>

      {/* TERMINAL */}
      <div ref={containerRef} className="flex-1 w-full h-full" />
    </div>
  );
}