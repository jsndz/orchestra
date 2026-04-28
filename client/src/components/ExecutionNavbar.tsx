import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useWorkflowStore } from "../store/useAppStore";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { useTerminalStore } from "../store/useTerminalStore";

type Props = {
  onStop: () => void;
  onRestart: () => void;
  onCreateYaml: () => void;
  status: "idle" | "loading" | "stopped";
};

export default function ExecutionNavbar({
  onStop,
  onRestart,
  onCreateYaml,
  status,
}: Props) {
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const navigate = useNavigate();
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const removeAllTerminals = useTerminalStore((s) => s.removeAllTerminals);
  const [editingName, setEditingName] = useState(false);
  const [globalState, setGlobalState] = useState<
    "idle" | "running" | "completed" | "failed" | "stopped" 
  >("idle");

  const getButtonText = () => {
    if (status === "loading") return "// STOPPING...";
    if (status === "stopped") return "STOPPED";
    return "STOP EXEC";
  };

  useEffect(() => {
    window.api.onGlobalStateChange((state) => {
      setGlobalState(state);
    });
  }, []);

  // Helper to determine status badge colors based on Tech-Noir palette
  const getStatusStyles = () => {
    switch (globalState) {
      case "running": return "border-accent text-accent animate-pulse";
      case "failed": return "border-red-500 text-red-500";
      case "completed": return "border-emerald-400 text-emerald-400";
      case "stopped": return "border-muted text-muted-foreground";
      case "idle": return "border-muted-foreground/40 text-muted-foreground";
      default: return "border-muted-foreground/40 text-muted-foreground";
    }
  };

  return (
    <div className="w-full flex justify-between items-center px-6 h-16 border-b border-border/20 bg-background">
      <div className="flex items-center gap-10">
        {/* LOGO */}
        <div
          className="flex justify-center items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <img src="./logo.png" alt="logo" className="w-7 h-7 grayscale brightness-200" />
          <h1 className="text-lg font-black tracking-[0.2em] uppercase text-foreground">
            ORCHESTRA
          </h1>
        </div>

        {/* BREADCRUMB & EDITABLE NAME */}
        <div className="flex items-center font-mono text-[10px] uppercase tracking-widest">
          <span className="text-muted-foreground/40">workflows</span>
          <span className="mx-3 text-muted-foreground/20">/</span>

          {editingName ? (
            <div className="relative">
              <Input
                autoFocus
                className="rounded-none border-accent/50 bg-black px-2 h-7 w-48 text-[11px] font-mono focus-visible:ring-1 focus-visible:ring-accent text-accent uppercase"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              />
            </div>
          ) : (
            <span
              className="text-accent font-bold cursor-pointer hover:bg-accent hover:text-background px-2 py-1 transition-colors border border-transparent"
              onClick={() => setEditingName(true)}
            >
              {workflowName || "UNTITLED_SEQUENCE"}
            </span>
          )}
        </div>

        {/* STATUS BADGE - Hardware Style */}
        <div className={`flex items-center gap-2 px-3 py-1 border font-mono text-[10px] tracking-tighter ${getStatusStyles()}`}>
          <div className={`w-1.5 h-1.5 bg-current ${globalState === 'running' ? 'animate-ping' : ''}`} />
          {globalState.toUpperCase()}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2">
        {(globalState === "failed" || globalState === "completed" || globalState === "stopped") && (
          <Button
            variant="outline"
            className="rounded-none border-border/40 font-mono text-[10px] tracking-widest uppercase hover:bg-white hover:text-black h-9"
            onClick={() => {
              removeAllTerminals();
              navigate("/tasks");
            }}
          >
            BACK TO EDIT
          </Button>
        )}

        <Button
          onClick={onRestart}
          variant="outline"
          disabled={status === "loading"}
          className="rounded-none border-border/40 font-mono text-[10px] tracking-widest uppercase hover:bg-white hover:text-black h-9"
        >
          RESTART EXEC
        </Button>

        <Button
          onClick={() => {
            setGlobalState("stopped");
            onStop();
          }}
          disabled={status === "loading" || status === "stopped"}
          className={`rounded-none font-mono text-[10px] tracking-widest uppercase h-9 transition-all
            ${status === "stopped" 
              ? "bg-muted text-muted-foreground border border-border/20" 
              : "bg-red-950/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"}`}
        >
          {getButtonText()}
        </Button>

        <Button
          onClick={onCreateYaml}
          className="rounded-none bg-accent text-background font-mono text-[10px] font-bold tracking-widest uppercase h-9 hover:bg-accent/80 glow-accent border-none px-6"
        >
          GEN YAML
        </Button>
      </div>
    </div>
  );
}