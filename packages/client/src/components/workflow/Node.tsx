import { Handle, Position } from "reactflow";
import { Server, Briefcase, Terminal } from "lucide-react";

export default function CustomNode({ data }: any) {
  const isService = data.type === "service";
  const Icon = isService ? Server : Briefcase;

  return (
    <div className="min-w-[280px] bg-background border border-border/60 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] group hover:border-accent/50 transition-colors">
      {/* Target Handle - Styled as a hardware port */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !rounded-none !bg-card !border-2 !border-border group-hover:!border-accent transition-colors -left-1.5"
      />

      {/* Header - Industrial Slate */}
      <div className="px-3 py-2 bg-card/50 border-b border-border/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={14} className={isService ? "text-accent" : "text-muted-foreground"} />
          <span className="text-[11px] font-mono font-bold uppercase tracking-tighter truncate text-foreground">
            {data.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[9px] font-mono px-1.5 py-0.5 border ${
            isService 
              ? "bg-accent/10 border-accent/30 text-accent" 
              : "bg-muted border-border text-muted-foreground"
          }`}>
            {isService ? "SERVICE" : "JOB"}
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-0 flex flex-col">
        {/* Namespace/Path */}
        <div className="px-3 py-1.5 border-b border-border/20 flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">dir:</span>
          <span className="text-[10px] font-mono text-muted-foreground truncate italic">
            {data.subLabel || "./root"}
          </span>
        </div>

        {/* Command - Terminal Style */}
        {data.command && (
          <div className="px-3 py-2 bg-black/40 flex items-start gap-2 group/cmd">
            <Terminal size={10} className="mt-0.5 text-accent/50 shrink-0" />
            <code className="text-[11px] font-mono text-emerald-400/90 leading-tight break-all line-clamp-2">
              {data.command}
            </code>
          </div>
        )}
      </div>

      {/* Source Handle - Styled as a hardware port */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !rounded-none !bg-card !border-2 !border-border group-hover:!border-accent transition-colors -right-1.5"
      />

      {/* Decorative Bottom Corner Accent */}
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}