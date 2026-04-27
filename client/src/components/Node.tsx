import { Handle, Position } from "reactflow";
import { Server, Briefcase } from "lucide-react";

export default function CustomNode({ data }: any) {
  const isService = data.type === "service";
  const Icon = isService ? Server : Briefcase;

  return (
    <div className="min-w-[260px] bg-card text-card-foreground border border-border font-sans">
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-background !border !border-border"
      />

      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={14} className="text-accent shrink-0" />

          <span className="text-xs font-semibold uppercase tracking-widest truncate">
            {data.label}
          </span>
        </div>

        <span className="text-[10px] text-muted-foreground shrink-0">
          {isService ? "SRV" : "JOB"}
        </span>
      </div>

      {/* Path */}
      <div className="px-3 py-2 text-[10px] text-muted-foreground border-b border-border truncate">
        {data.subLabel}
      </div>

      {/* Command */}
      {data.command && (
        <div className="px-3 py-2 text-xs text-foreground truncate">
          {data.command}
        </div>
      )}

 
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-background !border !border-border"
      />
    </div>
  );
}