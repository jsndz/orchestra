import { useEffect, useState } from "react";
import { TerminalPage } from "../components/TerminalView";
import LogPage from "../components/GraphView";
import { useSystemStats } from "../hooks/useTasks";
import ExecutionNavbar from "../components/ExecutionNavbar";
import { downloadYaml, execute, stopExecution } from "../api/tasks";
import { useWorkflowStore } from "../store/useAppStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

type ViewMode = "terminal" | "graph";

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
    execute();
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
      <footer className="w-full h-8 bg-background border-t px-4 flex items-center justify-between text-xs text-muted-foreground shrink-0">
        {systemStats ? (
          <>
            <div className="flex items-center gap-4">
              <span>CPU: {systemStats.cpuCores} cores</span>
              <span>
                Load:{" "}
                {systemStats.loadAvg
                  .map((l: number) => l.toFixed(2))
                  .join(", ")}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span>
                Memory:{" "}
                {((systemStats.usedMem / systemStats.totalMem) * 100).toFixed(
                  1,
                )}
                % used
              </span>
              <span>Platform: {systemStats.platform}</span>
            </div>
          </>
        ) : (
          <span>Loading system stats...</span>
        )}
      </footer>
    </div>
  );
}
