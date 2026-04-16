import { useTasks } from "../hooks/useTasks";
import { DependencyGraph } from "../components/GraphUI";

import UploadYaml from "../components/UploadYaml";
import { Button } from "../components/ui/button";
import { NavLink } from "react-router-dom";
import {
  Play,
  BarChart3,
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
  const { data, refetch } = useTasks();
  const { data: systemStats } = useSystemStats();
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);

  const [editingName, setEditingName] = useState(false);
  const tasks = data?.tasks ?? [];
  const dependencies = data?.dependencies ?? [];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const filteredTasks = tasks.filter((t) =>
    t.task.toLowerCase().includes(search.toLowerCase()),
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <div className="bg-background w-full h-16 flex items-center justify-between px-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <img src="./logo.png" alt="logo" width={160} />

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
          <UploadYaml
            onSuccess={(fileName) => {
              refetch();

              if (fileName) {
                const name = fileName.replace(".yaml", "");
                setWorkflowName(name);
              }
            }}
          />

          <Button>
            <NavLink to="/analysis" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analysis
            </NavLink>
          </Button>

          <Button>
            <NavLink to="/execution" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Run Workflow
            </NavLink>
          </Button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div
          className={`border-r bg-card transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-12"
          } flex flex-col`}
        >
          {/* TOGGLE */}
          <div className="flex items-center justify-between p-2 border-b">
            {sidebarOpen && (
              <span className="text-sm font-semibold">Workflow Steps</span>
            )}

            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              className="p-1 rounded hover:bg-muted h-7 w-7"
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Button>

            <Input
              className="bg-transparent outline-none text-sm flex-1 border-0 shadow-none focus-visible:ring-0 px-0 h-auto"
              placeholder="Search steps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {sidebarOpen && (
            <>
              <div className="p-2 border-b">
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

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-2 rounded cursor-pointer hover:bg-muted ${
                      editingTask?.id === t.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setEditingTask(t)}
                  >
                    <div className="font-medium text-sm">{t.task}</div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Folder size={12} />
                      {t.folder}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          t.type === "service"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {t.type}
                      </span>

                      {t.command && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Terminal size={10} />
                          {t.command.slice(0, 20)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
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
