import { useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface LogProps {
  logs: string[];
}

export default function LogViewer({ logs }: LogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
    shouldAutoScroll.current = isAtBottom;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (shouldAutoScroll.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full w-full bg-black border border-border/10">
      {/* LOG HEADER */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-card border-b border-border/10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-accent font-bold uppercase">
            LOG
          </span>
        </div>
        <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
          {logs.length} LINES_BUFFERED
        </div>

        {/* <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-accent/20" />
          <div className="w-1.5 h-1.5 bg-accent/40" />
          <div className="w-1.5 h-1.5 bg-accent animate-pulse shadow-[0_0_8px_rgba(225,244,243,0.5)]" />
        </div> */}
      </div>

      {/* LOG CONTENT */}
      <ScrollArea className="flex-1 w-full rounded-none">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-auto bg-[#0d0d0d] font-mono p-4"
        >
          {logs.length === 0 ? (
            <div className="text-muted-foreground/20 italic text-xs tracking-widest uppercase">
              Waiting for sequence execution...
            </div>
          ) : (
            logs.map((line, i) => (
              <div
                key={i}
                className="whitespace-pre-wrap break-words text-[13px] leading-relaxed mb-0.5 text-[#34d399]"
              >
                <span className="mr-3 text-muted-foreground/20 select-none text-[10px]">
                  {String(i + 1).padStart(4, "0")}
                </span>
                {line}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* FOOTER DECORATION */}
      <div className="h-1 w-full bg-accent/5 animate-pulse" />
    </div>
  );
}
