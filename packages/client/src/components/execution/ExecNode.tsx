import { Handle, Position } from "reactflow";
import { Server, Briefcase, Terminal, Activity } from "lucide-react";
import { StepState } from "@/types";
import { useResourceStore } from "@/store/useResourceStore";

const stateConfig: Record<StepState, { color: string; label: string; glow: boolean }> = {
  idle: { color: "border-muted-foreground/40", label: "IDLE", glow: false },
  starting: { color: "border-amber-500", label: "STARTING", glow: true },
  ready: { color: "border-emerald-500", label: "READY", glow: false },
  running: { color: "border-blue-500", label: "RUNNING", glow: true },
  completed: { color: "border-green-600", label: "COMPLETED", glow: false },
  failed: { color: "border-red-500", label: "FAILED", glow: true },
  stopped: { color: "border-gray-500", label: "STOPPED", glow: false },
};

export default function ExecNode({ data }: any) {
  const isService = data.type === "service";
  const state = (data.state as StepState) || "idle";
  const config = stateConfig[state];
  const Icon = isService ? Server : Briefcase;

  const stats = useResourceStore((s) => s.resources[data.id]);

  const isCpuDanger = stats && stats.cpu > 80;
  const isCpuWarning = stats && stats.cpu > 40 && stats.cpu <= 80;
  const isMemDanger = stats && stats.memory > 500;
  const isMemWarning = stats && stats.memory > 200 && stats.memory <= 500;

  const hasDanger = isCpuDanger || isMemDanger;
  const hasWarning = isCpuWarning || isMemWarning;

  let borderClass = config.color;
  let glowClass = config.glow ? "shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "";

  if (hasDanger) {
    borderClass = "border-red-500 bg-red-950/5";
    glowClass = "shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse";
  } else if (hasWarning) {
    borderClass = "border-yellow-500 bg-yellow-950/5";
    glowClass = "shadow-[0_0_20px_rgba(234,179,8,0.2)]";
  }

  return (
    <div 
      className={`min-w-[280px] bg-background border-2 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-300
      ${borderClass} 
      ${data.isSelected ? "ring-2 ring-white/20 scale-105" : ""}
      ${glowClass}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !rounded-none !bg-card !border-2 !border-inherit -left-1.5"
      />

      {/* Header */}
      <div className="px-3 py-2 bg-card/50 border-b border-border/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={14} className={isService ? "text-accent" : "text-muted-foreground"} />
          <span className="text-[11px] font-mono font-bold uppercase tracking-tighter truncate text-foreground">
            {data.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(config.glow || hasDanger || hasWarning) && <Activity size={10} className="animate-pulse text-inherit" />}
          <span className={`text-[9px] font-mono px-1.5 py-0.5 border ${borderClass} bg-black/20`}>
            {hasDanger ? "DANGER" : hasWarning ? "WARNING" : config.label}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-0 flex flex-col">
        <div className="px-3 py-1.5 border-b border-border/20 flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">dir:</span>
          <span className="text-[10px] font-mono text-muted-foreground truncate italic">
            {data.subLabel || "./root"}
          </span>
        </div>

        {stats && (
          <div className="px-3 py-1.5 border-b border-border/20 bg-black/40 flex items-center justify-between text-[10px] font-mono select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground/50 uppercase text-[9px]">CPU:</span>
              <span className={`font-semibold ${isCpuDanger ? "text-red-400 font-bold" : isCpuWarning ? "text-yellow-400 font-bold" : "text-foreground"}`}>
                {stats.cpu.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground/50 uppercase text-[9px]">RAM:</span>
              <span className={`font-semibold ${isMemDanger ? "text-red-400 font-bold" : isMemWarning ? "text-yellow-400 font-bold" : "text-foreground"}`}>
                {stats.memory.toFixed(0)} MB
              </span>
            </div>
          </div>
        )}

        {data.command && (
          <div className="px-3 py-2 bg-black/40 flex items-start gap-2">
            <Terminal size={10} className="mt-0.5 text-accent/50 shrink-0" />
            <code className="text-[11px] font-mono text-emerald-400/90 leading-tight line-clamp-2">
              {data.command}
            </code>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !rounded-none !bg-card !border-2 !border-inherit -right-1.5"
      />
    </div>
  );
}