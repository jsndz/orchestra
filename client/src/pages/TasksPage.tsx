import { useTasks } from "../hooks/useTasks";
import { DependencyGraph } from "../components/GraphUI";
import { Button } from "../components/ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Play,
  Search,
  ChevronLeft,
  ChevronRight,
  Folder,
  Terminal,
} from "lucide-react";
import WorkflowControls from "../components/TaskManager";
import { useSystemStats } from "../hooks/useTasks";
import { useState } from "react";
import { Task } from "../types";
import { useWorkflowStore } from "../store/useAppStore";
import { Input } from "@base-ui/react";

export default function TasksPage() {
  const { data } = useTasks();
  const { data: systemStats } = useSystemStats();

  const workflowName = useWorkflowStore((s) => s.workflowName);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);

  const [editingName, setEditingName] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasks = data?.tasks ?? [];
  const dependencies = data?.dependencies ?? [];

  const filteredTasks = tasks.filter((t) =>
    t.task.toLowerCase().includes(search.toLowerCase()),
  );
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <div className="bg-background w-full h-14 flex items-center justify-between px-6 border-b border-border/40 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-50">
        <div className="flex items-center gap-8">
          <div
            className="flex justify-center items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className=" p-1 rounded-none transition-none">
              <img src="./logo.png" alt="logo" width={32} height={32} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase text-foreground">
              ORCHESTRA
            </h1>
          </div>

          <div className="flex items-center font-mono text-[10px] uppercase tracking-[0.2em]">
            <span className="text-muted-foreground/60">Workflows</span>
            <span className="mx-3 text-muted-foreground/30">/</span>

            {editingName ? (
              <div className="relative">
                <Input
                  autoFocus
                  className=" border border-accent/40 rounded-none px-2 h-7 w-48 text-[11px] font-mono focus-visible:ring-0 text-accent uppercase"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setEditingName(false);
                  }}
                />
                <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-accent/30 animate-pulse" />
              </div>
            ) : (
              <span
                className="text-accent font-bold cursor-pointer hover:bg-accent hover:text-background px-2 py-0.5 transition-none border border-transparent hover:border-accent"
                onClick={() => setEditingName(true)}
              >
                {workflowName || "UNTITLED_SEQUENCE"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-px  p-0.5">
          <NavLink to="/execution">
            <Button className="rounded-none text-background hover:bg-btn-primary-hover font-mono text-[10px] font-black uppercase tracking-widest h-9 px-6 flex items-center gap-2 group transition-none ">
              <Play className="w-3 h-3 fill-current" />
              Run Workflow
            </Button>
          </NavLink>
        </div>
      </div>

      {/* MAIN */}

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - Tech Panel Style */}
        <div
          className={`border-r border-border bg-background transition-all duration-300 ${
            sidebarOpen ? "w-80" : "w-14"
          } flex flex-col`}
        >
          {/* HEADER - Industrial Control Bar */}
          <div className="flex items-center justify-between p-3 bg-card/30 border-b border-border/20 h-14">
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  Registry
                </span>
                <span className="text-[9px] font-mono text-muted-foreground uppercase">
                  Total_Steps: {filteredTasks.length}
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
                  const isActive = editingTask?.id === t.id;
                  const isService = t.type === "service";

                  return (
                    <div
                      key={t.id}
                      onClick={() => setEditingTask(t)}
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
                          {isService ? "SERVICE" : "JOB"}
                        </span>
                      </div>

                      {/* Metadata Row */}
                      <div className="flex items-center gap-3 mt-2 relative z-10">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground    tracking-tighter shrink-0">
                          <Folder
                            size={10}
                            className="text-muted-foreground/40"
                          />
                          <span>{t.folder || "root"}</span>
                        </div>
                      </div>

                      {/* Command Preview - Mini Terminal */}
                      {t.command && (
                        <div className="mt-3 relative z-10">
                          <div className="flex items-start gap-2 bg-black/40 p-2 border border-border/10">
                            <Terminal
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
        <div className="flex-1 relative">
          <DependencyGraph
            apiData={{ tasks, dependencies }}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
          />

          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <WorkflowControls tasks={tasks} dependencies={dependencies} />
          </div>
        </div>
      </div>
      {/* FOOTER */}
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
