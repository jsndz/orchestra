import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { SearchAddon } from "@xterm/addon-search";
import { Search, Download, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
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
  const searchAddonRef = useRef<SearchAddon | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: "block",
      fontFamily: "JetBrains Mono, Fira Code, monospace",
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
    const searchAddon = new SearchAddon();
    term.loadAddon(searchAddon);
    searchAddonRef.current = searchAddon;
    term.open(container);

    setTimeout(() => fitAddon.fit(), 0);

    termRef.current = term;
    fitRef.current = fitAddon;

    // Enable copy to clipboard via shortcuts
    term.attachCustomKeyEventHandler((event) => {
      // Ctrl+C or Cmd+C (standard) or Ctrl+Shift+C (common in terminals)
      const isCopy =
        ((event.ctrlKey || event.metaKey) && event.code === "KeyC") ||
        (event.ctrlKey && event.shiftKey && event.code === "KeyC");

      if (isCopy) {
        if (term.hasSelection()) {
          navigator.clipboard.writeText(term.getSelection());
          return false;
        }
      }
      return true;
    });

    // Right-click to copy selected text
    const handleContextMenu = (e: MouseEvent) => {
      if (term.hasSelection()) {
        e.preventDefault();
        navigator.clipboard.writeText(term.getSelection());
      }
    };
    container.addEventListener("contextmenu", handleContextMenu);

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(container);

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
      container.removeEventListener("contextmenu", handleContextMenu);
      unsubscribe?.();
      term.dispose();
    };
  }, [terminalId]);

  useEffect(() => {
    if (isActive) {
      setTimeout(() => fitRef.current?.fit(), 0);
    }
  }, [isActive]);

  const handleClearLogs = () => {
    if (termRef.current) {
      termRef.current.clear();
    }
  };

  const handleExportLogs = () => {
    if (!termRef.current) return;
    const term = termRef.current;
    const buffer = term.buffer.active;
    const linesCount = buffer.length;
    let lines = [];
    for (let i = 0; i < linesCount; i++) {
      const line = buffer.getLine(i);
      if (line) {
        lines.push(line.translateToString(true));
      }
    }
    const rawText = lines.join("\n");

    const blob = new Blob([rawText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}_logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSearchNext = (q: string) => {
    if (searchAddonRef.current && q) {
      searchAddonRef.current.findNext(q, { incremental: true });
    }
  };

  const handleSearchPrev = (q: string) => {
    if (searchAddonRef.current && q) {
      searchAddonRef.current.findPrevious(q);
    }
  };

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

        {/* UTILITIES BAR */}
        <div className="flex items-center gap-4">
          {searchOpen ? (
            <div className="flex items-center gap-1.5 bg-black border border-border/20 px-2 py-0.5 animate-in fade-in slide-in-from-right-2 duration-200">
              <input
                autoFocus
                className="bg-transparent outline-none border-none text-[10px] font-mono w-32 placeholder:text-muted-foreground/45 text-accent"
                placeholder="FIND_TEXT..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearchNext(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (e.shiftKey) handleSearchPrev(searchQuery);
                    else handleSearchNext(searchQuery);
                  }
                }}
              />
              <button onClick={() => handleSearchPrev(searchQuery)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <ChevronUp size={11} />
              </button>
              <button onClick={() => handleSearchNext(searchQuery)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <ChevronDown size={11} />
              </button>
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-muted-foreground hover:text-destructive cursor-pointer">
                <X size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-muted-foreground/60 hover:text-accent transition-colors p-1 cursor-pointer"
              title="Search logs"
            >
              <Search size={12} />
            </button>
          )}

          <button
            onClick={handleExportLogs}
            className="text-muted-foreground/60 hover:text-accent transition-colors p-1 cursor-pointer"
            title="Export logs"
          >
            <Download size={12} />
          </button>

          <button
            onClick={handleClearLogs}
            className="text-muted-foreground/60 hover:text-destructive transition-colors p-1 cursor-pointer"
            title="Clear terminal"
          >
            <Trash2 size={12} />
          </button>

          <div className="h-3 w-[1px] bg-border/20" />

          <div className="font-mono text-[9px] text-muted-foreground/30 uppercase tracking-[0.2em]">
            ID_{terminalId.split("-")[0]}
          </div>
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
