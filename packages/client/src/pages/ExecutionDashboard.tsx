import { useEffect, useState } from "react";
import { TerminalPage } from "@/components/execution/TerminalView";
import LogPage from "@/components/execution/GraphView";
import UnifiedLogView from "@/components/execution/UnifiedLogView";
import { useSystemStats } from "@/hooks/useTasks";
import ExecutionNavbar from "@/components/layout/ExecutionNavbar";
import { downloadYaml, execute, stopExecution } from "@/api/tasks";
import { useWorkflowStore } from "@/store/useAppStore";
import { useLogStore } from "@/store/useLogStore";
import { useResourceStore } from "@/store/useResourceStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cpu, Database, Clock, Laptop } from "lucide-react";

type ViewMode = "terminal" | "graph" | "unified";

export default function ExecutionDashboard() {
  const [view, setView] = useState<ViewMode>("terminal");
  const { data: systemStats } = useSystemStats();
  const [status, setStatus] = useState<"idle" | "loading" | "stopped">("idle");
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);

  const [showYamlModal, setShowYamlModal] = useState(false);
  const [tempName, setTempName] = useState(workflowName || "");
  const handleYaml = async () => {
    if (!workflowName || workflowName === "temp-workflow") {
      setShowYamlModal(true);
      return;
    }

    const res = await downloadYaml(workflowName);

    const blob = new Blob([res], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };
  useEffect(() => {
    if (showYamlModal) {
      setTempName(workflowName === "temp-workflow" ? "" : workflowName);
    }
  }, [showYamlModal, workflowName]);

  useEffect(() => {
    // Clear logs on fresh load/restart of execution dashboard
    useLogStore.getState().clearLogs();
    execute();

    // Start native task process resources stream
    window.api.startTaskResourcesStream();

    const addLog = useLogStore.getState().addLog;
    const unsubscribe = window.api.onTaskLog((log) => {
      addLog(log);
    });

    const unsubscribeResources = window.api.onTaskResourcesUpdate((data) => {
      useResourceStore.getState().setResources(data);
    });

    return () => {
      unsubscribe();
      unsubscribeResources();
      window.api.stopTaskResourcesStream();
      useResourceStore.getState().clearResources();
    };
  }, []);
  const handleStop = async () => {
    if (status !== "idle") return;

    try {
      setStatus("loading");
      const result = await stopExecution();
      setStatus(result?.ok ? "stopped" : "idle");
    } catch {
      setStatus("idle");
    }
  };

  const handleRestart = async () => {
    await handleStop();
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* NAVBAR */}
      <ExecutionNavbar
        onStop={handleStop}
        onRestart={handleRestart}
        onCreateYaml={handleYaml}
        status={status}
      />

      {/* CONTENT */}

      <div className="flex-1 relative overflow-hidden">
        <div className={view === "terminal" ? "h-full block" : "hidden"}>
          <TerminalPage />
        </div>

        <div className={view === "unified" ? "h-full block" : "hidden"}>
          <UnifiedLogView />
        </div>

        <div className={view === "graph" ? "h-full block" : "hidden"}>
          <LogPage />
        </div>
      </div>
      {/* VIEW SWITCHER */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-black border border-border/40 shadow-[0_0_30px_-5px_rgba(0,0,0,0.8)] flex p-1 gap-1">
          {/* TERMINAL TOGGLE */}
          <Button
            onClick={() => setView("terminal")}
            className={`
        px-6 py-1 h-9 rounded-none font-mono text-[10px] tracking-[0.2em] uppercase transition-none
        ${
          view === "terminal"
            ? "bg-accent text-background font-bold shadow-[0_0_10px_rgba(225,244,243,0.3)]"
            : "bg-transparent text-muted-foreground hover:bg-card hover:text-foreground border border-transparent"
        }
      `}
          >
            TERMINAL
          </Button>

          {/* SEPARATOR (Visual "Hardware" Notch) */}
          <div className="w-[1px] bg-border/20 my-2" />

          {/* UNIFIED LOGS TOGGLE */}
          <Button
            onClick={() => setView("unified")}
            className={`
        px-6 py-1 h-9 rounded-none font-mono text-[10px] tracking-[0.2em] uppercase transition-none
        ${
          view === "unified"
            ? "bg-accent text-background font-bold shadow-[0_0_10px_rgba(225,244,243,0.3)]"
            : "bg-transparent text-muted-foreground hover:bg-card hover:text-foreground border border-transparent"
        }
      `}
          >
            UNIFIED LOGS
          </Button>

          {/* SEPARATOR (Visual "Hardware" Notch) */}
          <div className="w-[1px] bg-border/20 my-2" />

          {/* GRAPH TOGGLE */}
          <Button
            onClick={() => setView("graph")}
            className={`
        px-6 py-1 h-9 rounded-none font-mono text-[10px] tracking-[0.2em] uppercase transition-none
        ${
          view === "graph"
            ? "bg-accent text-background font-bold shadow-[0_0_10px_rgba(225,244,243,0.3)]"
            : "bg-transparent text-muted-foreground hover:bg-card hover:text-foreground border border-transparent"
        }
      `}
          >
            GRAPH
          </Button>
        </div>
      </div>
      {showYamlModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-xl w-80">
            <Input
              autoFocus
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Workflow name"
              className="w-full border px-2 py-1 rounded mb-4"
            />

            <Button
              className="bg-primary text-white px-3 py-1 rounded text-sm"
              onClick={async () => {
                if (!tempName.trim()) return;
                setWorkflowName(tempName);
                await downloadYaml(tempName);
                setShowYamlModal(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}
      <footer className="w-full h-10 bg-card/60 backdrop-blur-md border-t border-border/40 px-6 flex items-center justify-between text-[11px] font-mono text-muted-foreground shrink-0 select-none">
        {systemStats ? (
          <>
            {/* LEFT: CPU INFO */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <Cpu size={13} className="text-accent" />
                <span className="text-foreground font-semibold max-w-[180px] truncate" title={systemStats.cpuModel}>
                  {systemStats.cpuModel}
                </span>
                <span className="text-[10px] text-muted-foreground/60">({systemStats.cpuCores} Cores)</span>
              </div>
              <div className="h-3 w-[1px] bg-border/40" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground/50 uppercase tracking-wider text-[9px]">Load:</span>
                <div className="flex gap-1.5">
                  {systemStats.loadAvg.map((load: number, idx: number) => {
                    const thresholdColor = load > systemStats.cpuCores ? "text-red-400 font-bold animate-pulse" : "text-foreground";
                    return (
                      <span key={idx} className={`px-1.5 py-0.5 bg-black/30 border border-border/10 rounded-sm text-[10px] ${thresholdColor}`}>
                        {load.toFixed(2)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: MEMORY, UPTIME, PLATFORM */}
            <div className="flex items-center gap-5">
              {/* UPTIME */}
              {systemStats.uptime !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-muted-foreground/60" />
                  <span className="text-muted-foreground/50 uppercase tracking-wider text-[9px]">Uptime:</span>
                  <span className="text-foreground font-semibold">
                    {(() => {
                      const sec = systemStats.uptime;
                      const h = Math.floor(sec / 3600);
                      const m = Math.floor((sec % 3600) / 60);
                      return h > 0 ? `${h}h ${m}m` : `${m}m`;
                    })()}
                  </span>
                </div>
              )}
              
              <div className="h-3 w-[1px] bg-border/40" />

              {/* MEMORY */}
              <div className="flex items-center gap-3">
                <Database size={13} className="text-accent" />
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/50 uppercase tracking-wider text-[9px]">Memory:</span>
                  <span className="text-foreground font-semibold">
                    {(systemStats.usedMem / (1024 * 1024 * 1024)).toFixed(1)} GB
                  </span>
                  <span className="text-muted-foreground/60">/</span>
                  <span className="text-muted-foreground/60">
                    {(systemStats.totalMem / (1024 * 1024 * 1024)).toFixed(1)} GB
                  </span>
                </div>
                {/* Custom mini progress bar */}
                <div className="w-16 h-1.5 bg-black/40 border border-border/20 rounded-none overflow-hidden relative">
                  {(() => {
                    const ratio = systemStats.usedMem / systemStats.totalMem;
                    const percent = Math.min(100, Math.max(0, ratio * 100));
                    const isHigh = percent > 85;
                    const barColor = isHigh ? "bg-red-500" : "bg-accent";
                    return (
                      <div 
                        className={`h-full ${barColor} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    );
                  })()}
                </div>
              </div>

              <div className="h-3 w-[1px] bg-border/40" />

              {/* PLATFORM */}
              <div className="flex items-center gap-2">
                <Laptop size={13} className="text-muted-foreground/60" />
                <span className="text-muted-foreground/50 uppercase tracking-wider text-[9px]">OS:</span>
                <span className="text-foreground font-semibold uppercase">{systemStats.platform}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 w-full justify-center text-muted-foreground/60">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            <span>Establishing native OS stats stream...</span>
          </div>
        )}
      </footer>
    </div>
  );
}
