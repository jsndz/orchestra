import { useTasks } from "@/hooks/useTasks";
import { DependencyGraph } from "@/components/workflow/GraphUI";
import { Button } from "@/components/ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Play,
  Search,
  ChevronLeft,
  ChevronRight,
  Folder,
  Terminal,
} from "lucide-react";
import WorkflowControls from "@/components/workflow/TaskManager";
import { useSystemStats } from "@/hooks/useTasks";
import { useState, useEffect } from "react";
import { Task } from "@/types";
import { useWorkflowStore } from "@/store/useAppStore";
import { Input } from "@base-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { downloadYaml } from "@/api/tasks";

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

  const queryClient = useQueryClient();
  const [workspaceDir, setWorkspaceDir] = useState<string>(() => localStorage.getItem("workspaceDir") || "");
  const [workspaceWorkflows, setWorkspaceWorkflows] = useState<string[]>([]);
  const [yamlOpen, setYamlOpen] = useState(false);
  const [yamlCode, setYamlCode] = useState("");
  const [yamlError, setYamlError] = useState<string | null>(null);

  const loadWorkflows = async (dir: string) => {
    if (!dir) return;
    try {
      const list = await window.api.listWorkspace(dir);
      setWorkspaceWorkflows(list);
    } catch (e) {
      console.error("Failed to list workspace workflows:", e);
    }
  };

  useEffect(() => {
    if (workspaceDir) {
      loadWorkflows(workspaceDir);
    }
  }, [workspaceDir]);

  const handleSelectWorkspaceDir = async () => {
    const dir = await window.api.selectFolder();
    if (dir) {
      setWorkspaceDir(dir);
      localStorage.setItem("workspaceDir", dir);
    }
  };

  const handleLoadWorkflow = async (name: string) => {
    const res = await window.api.loadWorkspaceWorkflow(workspaceDir, name);
    if (res.ok) {
      setWorkflowName(name);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } else {
      alert(`Load failed: ${res.error}`);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workspaceDir) {
      alert("Please select a workspace directory first.");
      return;
    }
    const name = workflowName || "untitled";
    const res = await window.api.saveWorkspaceWorkflow(workspaceDir, name);
    if (res.ok) {
      alert(`Workflow "${name}" saved successfully to workspace!`);
      loadWorkflows(workspaceDir);
    } else {
      alert(`Save failed: ${res.error}`);
    }
  };

  const toggleYamlPanel = async () => {
    if (!yamlOpen) {
      try {
        const text = await downloadYaml(workflowName || "temp-workflow");
        setYamlCode(text);
        setYamlError(null);
      } catch (e) {
        console.error(e);
      }
    }
    setYamlOpen(!yamlOpen);
  };

  const handleYamlChange = async (val: string) => {
    setYamlCode(val);
    try {
      const result = await window.api.importYaml(val);
      if (result && result.ok) {
        setYamlError(null);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        setYamlError("Validation failed");
      }
    } catch (e: any) {
      setYamlError(e.message || "Invalid YAML syntax");
    }
  };

  useEffect(() => {
    if (yamlOpen) {
      downloadYaml(workflowName || "temp-workflow").then((text) => {
        if (text.trim() !== yamlCode.trim()) {
          setYamlCode(text);
        }
      });
    }
  }, [tasks, dependencies, workflowName, yamlOpen]);

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
              <img src="./icon.png" alt="logo" width={32} height={32} />
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

        <div className="flex items-center gap-2 p-0.5">
          {workspaceDir && (
            <Button
              onClick={handleSaveWorkflow}
              variant="outline"
              className="rounded-none font-mono text-[10px] uppercase h-9 px-4 border-border/40 hover:bg-white hover:text-black cursor-pointer"
            >
              Save File
            </Button>
          )}

          <Button
            onClick={toggleYamlPanel}
            variant="outline"
            className={`rounded-none font-mono text-[10px] uppercase h-9 px-4 border-border/40 cursor-pointer ${
              yamlOpen
                ? "bg-accent text-background hover:bg-accent/80 font-bold shadow-[0_0_10px_rgba(225,244,243,0.2)]"
                : "hover:bg-white hover:text-black"
            }`}
          >
            {yamlOpen ? "Hide YAML" : "View YAML"}
          </Button>

          <NavLink to="/execution">
            <Button className="rounded-none text-background hover:bg-btn-primary-hover font-mono text-[10px] font-black uppercase tracking-widest h-9 px-6 flex items-center gap-2 group transition-none cursor-pointer">
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

          {/* WORKSPACE DIRECTORY PANEL */}
          {sidebarOpen && (
            <div className="p-3 border-b border-border/10 bg-black/40">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-2">Workspace Directory</span>
              <div className="flex gap-2">
                <input
                  readOnly
                  placeholder="NO_DIRECTORY_SELECTED"
                  className="bg-card border border-border/40 px-2 py-1 text-[10px] font-mono truncate flex-1 opacity-70"
                  value={workspaceDir}
                />
                <Button
                  size="sm"
                  className="rounded-none h-6 px-2 text-[9px] font-mono hover:bg-accent uppercase border border-border/45 cursor-pointer"
                  onClick={handleSelectWorkspaceDir}
                >
                  Browse
                </Button>
              </div>

              {workspaceDir && workspaceWorkflows.length > 0 && (
                <div className="mt-3 space-y-1 max-h-32 overflow-y-auto custom-scrollbar border-t border-border/15 pt-2">
                  <span className="text-[8px] font-mono text-muted-foreground/60 uppercase tracking-widest block mb-1">Workflows:</span>
                  {workspaceWorkflows.map((name) => (
                    <div
                      key={name}
                      onClick={() => handleLoadWorkflow(name)}
                      className={`text-[10px] font-mono px-2 py-1 cursor-pointer truncate uppercase ${
                        workflowName === name
                          ? "text-accent font-bold bg-accent/10 border-l border-accent"
                          : "text-muted-foreground hover:bg-card/40 hover:text-foreground"
                      }`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

        {/* YAML LIVE CODE PANEL */}
        {yamlOpen && (
          <div className="w-[420px] border-r border-border bg-black flex flex-col h-full font-mono text-xs z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-card/45 h-14 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent">YAML LIVE EDITOR</span>
              {yamlError ? (
                <span className="text-[9px] text-red-500 font-bold uppercase truncate max-w-[200px]" title={yamlError}>
                  ERR: {yamlError}
                </span>
              ) : (
                <span className="text-[9px] text-emerald-400 font-bold uppercase">YAML VALID</span>
              )}
            </div>
            <textarea
              className="flex-1 w-full bg-black/90 p-4 outline-none text-emerald-400/90 font-mono resize-none text-[11px] leading-relaxed custom-scrollbar border-none"
              value={yamlCode}
              onChange={(e) => handleYamlChange(e.target.value)}
              placeholder="# ENTER WORKFLOW YAML DEFINITION HERE..."
            />
          </div>
        )}

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
