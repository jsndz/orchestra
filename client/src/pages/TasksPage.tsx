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
      <div className="bg-background w-full h-16 flex items-center justify-between px-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex  justify-center items-center gap-1">
            {" "}
            <img
              src="./logo.png"
              alt="logo"
              width={50}
              height={25}
              onClick={() => navigate("/")}
            />
            <h1 className="text-4xl font-semibold tracking-tight uppercase">
              ORCHESTRA
            </h1>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground">workflows</span>
            <span className="mx-1 text-muted-foreground">/</span>

            {editingName ? (
              <Input
                autoFocus
                className="border rounded px-1 text-sm w-40 h-8"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setEditingName(false);
                }}
              />
            ) : (
              <span
                className="font-medium cursor-pointer hover:underline"
                onClick={() => setEditingName(true)}
              >
                {workflowName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* <UploadYaml
            onSuccess={(fileName) => {
              refetch();
              if (fileName) {
                setWorkflowName(fileName.replace(".yaml", ""));
              }
            }}
          /> */}
          {/* 
          <Button>
            <NavLink to="/analysis" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analysis
            </NavLink>
          </Button> */}

          <Button>
            <NavLink to="/execution" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Run Workflow
            </NavLink>
          </Button>
        </div>
      </div>

      {/* MAIN */}

      <div className="flex flex-1 overflow-hidden ">
        {/* SIDEBAR */}
        <div
          className={`border-r bg-background transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-12"
          } flex flex-col`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-2 ">
            {sidebarOpen && (
              <span className="text-sm font-semibold">Workflow Steps</span>
            )}

            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              className="p-1 h-7 w-7"
            >
              {sidebarOpen ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </Button>
          </div>

          {/* SEARCH */}
          {sidebarOpen && (
            <div className="p-2 ">
              <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded">
                <Search size={14} className="text-muted-foreground" />
                <input
                  className="bg-transparent outline-none text-sm flex-1"
                  placeholder="Search steps..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* TASK LIST */}
          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {filteredTasks.map((t) => {
                const isActive = editingTask?.id === t.id;
                const isService = t.type === "service";

                return (
                  <div
                    key={t.id}
                    onClick={() => setEditingTask(t)}
                    className={`
            cursor-pointer bg-card border transition-all
            px-3 py-3
            ${
              isActive
                ? "border-accent bg-muted"
                : "border-border/30 hover:border-border hover:bg-muted/50"
            }
          `}
                  >
                    {/* Title */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm truncate uppercase tracking-wide">
                        {t.task}
                      </div>

                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {isService ? "SRV" : "JOB"}
                      </span>
                    </div>

                    {/* Folder */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 truncate">
                      <Folder size={12} className="shrink-0" />
                      <span className="truncate">{t.folder}</span>
                    </div>

                    {/* Command */}
                    {t.command && (
                      <div className="flex items-center gap-1 text-[11px] text-foreground mt-3 truncate border-t border-border/20 pt-2">
                        <Terminal
                          size={11}
                          className="shrink-0 text-muted-foreground"
                        />
                        <span className="truncate">{t.command}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* GRAPH */}
        <div className="flex-1 relative">
          <DependencyGraph
            apiData={{ tasks, dependencies }}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
            <WorkflowControls tasks={tasks} dependencies={dependencies} />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full h-8 bg-card border-t px-4 flex items-center justify-between text-xs text-muted-foreground shrink-0">
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
