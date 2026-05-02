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
      cursorStyle: 'block',
      fontFamily: 'JetBrains Mono, Fira Code, monospace',
      fontSize: 13,
      letterSpacing: 0,
      lineHeight: 1.2,
      scrollback: 2000,
      convertEol: true,
      theme: { 
        background: "#0d0d0d",
        foreground: "#34d399", 
        cursor: "#e1f4f3", 
        selectionBackground: "rgba(225, 244, 243, 0.3)",
        black: "#0d0d0d",
        red: "#ef4444",
        green: "#34d399",
        yellow: "#facc15",
        blue: "#3b82f6",
        magenta: "#d946ef",
        cyan: "#e1f4f3",
        white: "#ffffff",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);

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

  useEffect(() => {
    if (isActive) {
      setTimeout(() => fitRef.current?.fit(), 0);
    }
  }, [isActive]);
console.log(name,status);

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* NODE HEADER - Hardware Style */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-card border-b border-border/10">
        <div className="flex items-center gap-3">
          {/* Status Indicator: Square, no rounding */}
          <div
            className={`h-2 w-2 ${
              status === "running"
                ? "bg-yellow-500 animate-pulse"
                : status === "success"
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          />
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            STREAM::{name}
          </span>
        </div>
        <div className="font-mono text-[9px] text-muted-foreground/30 uppercase tracking-[0.2em]">
          ID_{terminalId.split('-')[0]}
        </div>
      </div>

      {/* TERMINAL OUTPUT */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full p-2 bg-black overflow-hidden" 
      />
    </div>
  );
}