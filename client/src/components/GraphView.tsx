import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks, useSystemStats, useLogs } from "../hooks/useTasks";
import { stopExecution } from "../api/tasks";
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  Terminal as TerminalIcon,
  Search,
} from "lucide-react";
import { ExecGraph } from "./ExecGraph";
import LogViewer, { LogEntry } from "./LogView";
import { Button } from "./ui/button";

export default function LogPage() {
  const { data } = useTasks();
  const { data: systemStats } = useSystemStats();
  const [logsMap, setLogsMap] = useState<Record<string, LogEntry[]>>({});
  const navigate = useNavigate();

  const [status, setStatus] = useState<"idle" | "loading" | "stopped">("idle");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  const [localTasks, setLocalTasks] = useState<any[]>([]);

  const dependencies = data?.dependencies ?? [];

  const { data: logsData } = useLogs(selectedTaskId);
  
  useEffect(() => {
    if (data?.tasks) {
      setLocalTasks(data.tasks);
    }
  }, [data]);

  useEffect(() => {
    const handler = (payload: { id: string; state: string }) => {
      setLocalTasks((prev) =>
        prev.map((t) =>
          t.id === payload.id ? { ...t, state: payload.state } : t,
        ),
      );
    };

    window.api.onTaskStateChange(handler);
  }, []);

  useEffect(() => {
    const cleanup = window.api.onTaskLog((log) => {
      setLogsMap((prev) => {
        const taskLogs = prev[log.taskId] || [];
        const newEntry: LogEntry = {
          message: log.message,
          color: log.color,
          label: log.label,
        };
        return {
          ...prev,
          [log.taskId]: [...taskLogs, newEntry].slice(-1000),
        };
      });
    });

    return cleanup;
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

  const filteredTasks = localTasks.filter((t) =>
    t.task.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedTask = localTasks.find((t) => t.id === selectedTaskId);
  const logs = selectedTaskId ? logsMap[selectedTaskId] || [] : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 relative overflow-hidden">
        {/* SIDEBAR - Matching TasksPage Design */}
        <div
          className={`border-r border-border bg-background transition-all duration-300 ${
            sidebarOpen ? "w-80" : "w-14"
          } flex flex-col shrink-0`}
        >
          {/* HEADER - Industrial Control Bar */}
          <div className="flex items-center justify-between p-3 bg-card/30 border-b border-border/20 h-14">
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  Execution_Registry
                </span>
                <span className="text-[9px] font-mono text-muted-foreground uppercase">
                  Steps: {filteredTasks.length}
                </span>
              </div>
            )}

            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              className={`p-0 h-8 w-8 rounded-none border border-border/20 hover:bg-accent hover:text-accent-foreground transition-colors ${
                !sidebarOpen && "mx-auto"
              }`}
            >
              {sidebarOpen ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </Button>
          </div>

          {/* SEARCH - Command Line Style */}
          {sidebarOpen && (
            <div className="p-3 border-b border-border/10 bg-black/20">
              <div className="flex items-center gap-2 bg-card border border-border/40 px-3 py-1.5 focus-within:border-accent transition-colors">
                <Search size={14} className="text-muted-foreground" />
                <input
                  className="bg-transparent outline-none text-xs font-mono flex-1 placeholder:text-muted-foreground/50"
                  placeholder="FILTER_PROCESSES..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* TASK LIST */}
          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col">
                {filteredTasks.map((t) => {
                  const isActive = selectedTaskId === t.id;
                  const isService = t.type === "service";

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className={`
                        relative cursor-pointer transition-all border-b border-border/10
                        px-4 py-4 group
                        ${
                          isActive
                            ? "bg-accent/5 border-l-4 border-l-accent"
                            : "bg-transparent border-l-4 border-l-transparent hover:bg-card/50"
                        }
                      `}
                    >
                      {/* Active Indicator Glow */}
                      {isActive && (
                        <div className="absolute inset-0 bg-accent/5 animate-pulse pointer-events-none" />
                      )}

                      {/* Title & Type */}
                      <div className="flex items-center justify-between gap-2 relative z-10">
                        <div
                          className={`font-mono text-xs font-bold truncate uppercase tracking-tight ${
                            isActive ? "text-accent" : "text-foreground"
                          }`}
                        >
                          {t.task}
                        </div>

                        <span
                          className={`text-[9px] font-mono px-1 border ${
                            isService
                              ? "border-accent/40 text-accent bg-accent/5"
                              : "border-muted-foreground/30 text-muted-foreground"
                          }`}
                        >
                          {t.state || (isService ? "SERVICE" : "JOB")}
                        </span>
                      </div>

                      {/* Metadata Row */}
                      <div className="flex items-center gap-3 mt-2 relative z-10">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground tracking-tighter shrink-0">
                          <Folder
                            size={10}
                            className="text-muted-foreground/40"
                          />
                          <span>{t.folder || "root"}</span>
                        </div>
                      </div>

                      {/* Command Preview */}
                      {t.command && (
                        <div className="mt-3 relative z-10">
                          <div className="flex items-start gap-2 bg-black/40 p-2 border border-border/10">
                            <TerminalIcon
                              size={10}
                              className="mt-0.5 text-muted-foreground/50 shrink-0"
                            />
                            <code className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate">
                              {t.command}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* GRAPH */}
        <div className="flex-1 relative">
          <ExecGraph
            apiData={{ tasks: localTasks, dependencies }}
            selectedId={selectedTaskId}
            onNodeClick={(id) => setSelectedTaskId(id)}
          />
        </div>

        {/* TERMINAL */}
        <div
          className={`absolute top-0 right-0 h-full w-[500px] bg-background border-l border-border/20 shadow-[ -10px_0_30px_rgba(0,0,0,0.8)] 
  transition-transform duration-200 z-40 flex flex-col
  ${selectedTaskId ? "translate-x-0" : "translate-x-full"}`}
        >
          {selectedTask && (
            <>
              {/* HEADER - Consistent with "Edit Step" styling */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-card/30">
                <div className="flex flex-col">
                  <h2 className="font-mono font-bold text-sm tracking-tighter uppercase text-accent">
                    Task Inspector: <span>{selectedTask.task}</span>
                  </h2>
                  <h2 className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em]">
                  PATH::{selectedTask.folder}
                    </h2>
                </div>

                <Button
                  onClick={() => setSelectedTaskId(null)}
                  variant="ghost"
                  className="p-1 rounded-none hover:bg-accent hover:text-accent-foreground transition-colors h-8 w-8 border border-transparent hover:border-accent flex items-center justify-center"
                >
                  <ChevronRight size={18} />
                </Button>
              </div>

         

              {/* LOG VIEWER SECTION */}
              <div className="flex-1 flex flex-col bg-black">
         
                <div className="flex-1 p-0 overflow-hidden">
                  <LogViewer logs={logs} />
                </div>
              </div>

              {/* FOOTER - Tech Slate style spacing */}
              <div className="h-4 bg-card/30 border-t border-border/10 flex items-center px-6">
                <div className="w-full h-[1px] bg-accent/5" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
