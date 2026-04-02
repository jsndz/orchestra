import { useEffect, useRef } from "react";
import { terminalService } from "../lib/terminalService";
import { useTerminalStore } from "../store/useTerminalStore";

type Props = {
  terminalId: string;
  name: string;
  status: "running" | "success" | "failed";
};

export default function Terminal({ terminalId, name, status }: Props) {

  const containerRef = useRef<HTMLDivElement>(null); 
  useEffect(() => {
    if (!containerRef.current) return;
    terminalService.create(terminalId,containerRef.current);
    
    return () => {
      terminalService.dispose(terminalId);
    };
  },[]);

  return (
    <div className="flex flex-col rounded-lg overflow-hidden bg-black border border-zinc-700">
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 text-xs text-zinc-300">
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

      <div className="h-80" ref={containerRef} />
    </div>
  );
}