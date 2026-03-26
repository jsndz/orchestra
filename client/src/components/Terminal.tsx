import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
type Props = {
  terminalId: string;
  status: "running" | "success" | "failed";
  name: string;
  register: (id: string, term: XTerm) => void;
};

export default function Terminal({
  terminalId,
  status,
  name,
  register,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      scrollback: 2000,
      convertEol: true,
      theme: {
        background: "#000000",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    register(terminalId, term);

    const resize = () => fitAddon.fit();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      term.dispose();
    };
  }, []);

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
