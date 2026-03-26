import { useEffect, useRef } from "react";

interface LogProps {
  logs: string[];
}

export default function LogViewer({ logs }: LogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 10;

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
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-auto bg-black text-sm text-green-400 font-mono p-3 rounded"
    >
      {logs.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap break-words">
          {line}
        </div>
      ))}
    </div>
  );
}