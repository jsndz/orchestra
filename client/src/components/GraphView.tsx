import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks, useSystemStats, useLogs } from "../hooks/useTasks";
import { stopExecution } from "../api/tasks";
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  Terminal as TerminalIcon,
} from "lucide-react";
import { ExecGraph } from "./ExecGraph";
import LogViewer from "./LogView";

export default function LogPage() {
  const { data } = useTasks();
  const { data: systemStats } = useSystemStats();
  const [logsMap, setLogsMap] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();

  const [status, setStatus] = useState<"idle" | "loading" | "stopped">("idle");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        return {
          ...prev,
          [log.taskId]: [...taskLogs, log.message].slice(-1000),
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

  const selectedTask = localTasks.find((t) => t.id === selectedTaskId);
  const logs = selectedTaskId ? logsMap[selectedTaskId] || [] : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 relative overflow-hidden">
        {/* SIDEBAR */}
        <div
          className={`border-r bg-card transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-12"
          } flex flex-col shrink-0`}
        >
          <div className="flex items-center justify-between p-2 border-b">
            {sidebarOpen && (
              <span className="text-sm font-semibold">Workflow Steps</span>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded hover:bg-muted"
            >
              {sidebarOpen ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          </div>

          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {localTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className={`p-2 rounded cursor-pointer transition ${
                    selectedTaskId === t.id
                      ? "bg-muted border border-primary"
                      : "bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <div className="font-medium text-sm">{t.task}</div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Folder size={12} />
                    {t.folder}
                  </div>

                  {t.command && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2 truncate">
                      <TerminalIcon size={10} />
                      {t.command}
                    </div>
                  )}

                  {/* 🔥 show state */}
                  <div className="text-xs mt-2">{t.state}</div>
                </div>
              ))}
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
          className={`absolute top-0 right-0 h-full w-[500px] bg-card border-l shadow-2xl 
          transition-transform duration-300 z-40
          ${selectedTaskId ? "translate-x-0" : "translate-x-full"}`}
        >
          {selectedTask && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <div className="font-semibold text-sm">
                    {selectedTask.task}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedTask.folder}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTaskId(null)}
                  className="p-1 rounded hover:bg-muted"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="flex-1 p-3 overflow-auto">
                <LogViewer logs={logs} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
