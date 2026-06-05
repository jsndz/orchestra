import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

import { Dependency, nodeTypes, ReadyWhen, Task } from "@/types";
import { useCallback, useEffect, useState } from "react";
import {
  useDeleteTask,
  useDeleteDependency,
  useAddDependency,
  useUpdateTask,
} from "@/hooks/useTasks";
import { analyze } from "@/api/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

export function toReactFlowGraphFromLevels(
  levels: Task[][],
  deps: Dependency[],
) {
  const horizontalSpacing = 400;
  const verticalSpacing = 160;

  const nodes: Node[] = [];

  levels.forEach((levelTasks, levelIndex) => {
    const totalHeight = levelTasks.length * verticalSpacing;
    const startY = -totalHeight / 2;

    levelTasks.forEach((task, i) => {
      const hasCoords = typeof task.x === "number" && typeof task.y === "number";
      nodes.push({
        id: task.id,
        type: "custom",
        position: hasCoords
          ? { x: task.x!, y: task.y! }
          : {
              x: levelIndex * horizontalSpacing,
              y: startY + i * verticalSpacing,
            },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: task.task,
          subLabel: task.folder,
          type: task.type,
          command: task.command,
        },
      });
    });
  });

  const edges: Edge[] = deps.map((d) => ({
    id: `${d.from}->${d.to}`,
    source: d.from,
    target: d.to,
    type: "smoothstep", // curved
    animated: true, // optional but looks good
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#e1f4f3",
    },
    style: {
      stroke: "#e1f4f3",
      strokeWidth: 2,
    },
  }));

  return { nodes, edges };
}
export function DependencyGraph({
  apiData,
  editingTask,
  setEditingTask,
}: {
  apiData: { tasks: Task[]; dependencies: Dependency[] };
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [taskName, setTaskName] = useState("");
  const [folderName, setFolderName] = useState("");
  const [command, setCommand] = useState("");

  const [taskType, setTaskType] = useState<"job" | "service">("job");
  const [readyKind, setReadyKind] = useState<"exit" | "port" | "log">("exit");
  const [readyPort, setReadyPort] = useState<number>(3000);
  const [readyLogMatch, setReadyLogMatch] = useState("");
  const [levels, setLevels] = useState<Task[][]>([]);
  const [logMatchType, setLogMatchType] = useState<"text" | "regex">("text");

  const [retries, setRetries] = useState<number | string>("");
  const [timeoutVal, setTimeoutVal] = useState<number | string>("");
  const [envStr, setEnvStr] = useState<string>("");

  useEffect(() => {
    if (!editingTask) return;

    setTaskName(editingTask.task);
    setFolderName(editingTask.folder);
    setCommand(editingTask.command ?? "");
    setTaskType(editingTask.type);

    setRetries(editingTask.retries !== undefined && editingTask.retries !== null ? editingTask.retries : "");
    setTimeoutVal(editingTask.timeout !== undefined && editingTask.timeout !== null ? editingTask.timeout : "");
    const envObj = editingTask.env || {};
    const serializedEnv = Object.entries(envObj)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    setEnvStr(serializedEnv);

    if (editingTask.ready) {
      setReadyKind(editingTask.ready.kind);

      if (editingTask.ready.kind === "port") {
        setReadyPort(editingTask.ready.port);
      }

      if (editingTask.ready.kind === "log") {
        setReadyLogMatch(String(editingTask.ready.match));

        setLogMatchType(editingTask.ready.isRegex ? "regex" : "text");
      }
    } else {
      setReadyKind("exit");
    }
  }, [editingTask]);
  useEffect(() => {
    analyze("parallel").then((res) => {
      if (res.ok) {
        setLevels(res.levels);
      }
    });
  }, [apiData.tasks, apiData.dependencies]);
  const deleteTaskMutation = useDeleteTask();
  const deleteDependencyMutation = useDeleteDependency();
  const addDependencyMutation = useAddDependency();
  const updateTaskMutation = useUpdateTask();

  useEffect(() => {
    const { nodes, edges } = toReactFlowGraphFromLevels(
      levels,
      apiData.dependencies,
    );
    setNodes(nodes);
    setEdges(edges);
  }, [levels, apiData.dependencies]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      deletedNodes.forEach((node) => {
        deleteTaskMutation.mutate(node.id);
      });
    },
    [deleteTaskMutation],
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      deletedEdges.forEach((edge) => {
        deleteDependencyMutation.mutate({
          from: edge.source,
          to: edge.target,
        });
      });
    },
    [deleteDependencyMutation],
  );

  const introducesCycle = useCallback((fromId: string, toId: string) => {
    const adj: Record<string, string[]> = {};
    for (const dep of apiData.dependencies) {
      if (!adj[dep.from]) adj[dep.from] = [];
      adj[dep.from].push(dep.to);
    }
    const visited = new Set<string>();
    const queue = [toId];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === fromId) return true;
      visited.add(curr);
      for (const neighbor of adj[curr] ?? []) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
    return false;
  }, [apiData.dependencies]);

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const task = apiData.tasks.find((t) => t.id === node.id);
      if (task) {
        updateTaskMutation.mutate({
          id: task.id,
          updates: {
            x: Math.round(node.position.x),
            y: Math.round(node.position.y),
          },
        });
      }
    },
    [apiData.tasks, updateTaskMutation],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      if (introducesCycle(params.source, params.target)) {
        alert("Error: Connecting these nodes would introduce a dependency cycle/loop!");
        return;
      }

      addDependencyMutation.mutate({
        from: params.source,
        to: params.target,
      });
    },
    [addDependencyMutation, introducesCycle],
  );

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      const task = apiData.tasks.find((t) => t.id === node.id);
      if (!task) return;

      setEditingTask(task);
    },
    [apiData.tasks, setEditingTask],
  );
  const handleUpdateTask = () => {
    if (!editingTask) return;

    let ready: ReadyWhen | undefined = undefined;

    if (taskType === "service") {
      if (readyKind === "exit") {
        ready = { kind: "exit" };
      }

      if (readyKind === "port") {
        ready = { kind: "port", port: readyPort };
      }

      if (readyKind === "log") {
        ready = {
          kind: "log",
          match:
            logMatchType === "regex"
              ? new RegExp(readyLogMatch)
              : readyLogMatch,
          isRegex: logMatchType === "regex",
        };
      }
    }

    const logRules =
      editingTask.logRules?.map((rule) => ({
        ...rule,
        match: rule.isRegex
          ? new RegExp(String(rule.match))
          : String(rule.match),
      })) ?? [];

    const envObj: Record<string, string> = {};
    envStr.split("\n").forEach((line) => {
      const idx = line.indexOf("=");
      if (idx !== -1) {
        const k = line.substring(0, idx).trim();
        const v = line.substring(idx + 1).trim();
        if (k) envObj[k] = v;
      }
    });

    updateTaskMutation.mutate({
      id: editingTask.id,
      updates: {
        task: taskName,
        folder: folderName,
        command,
        type: taskType,
        ready,
        logRules,
        x: editingTask.x,
        y: editingTask.y,
        retries: retries === "" ? 0 : (Number(retries) || 0),
        timeout: timeoutVal === "" ? 0 : (Number(timeoutVal) || 0),
        env: envObj,
      },
    });

    setEditingTask(null);
  };
  return (
    <>
      <div style={{ width: "100%", height: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onNodeClick={onNodeClick}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          fitView
          minZoom={0.1}
          maxZoom={4}
          nodesDraggable
          elementsSelectable
          nodesConnectable
          deleteKeyCode={["Backspace", "Delete"]}
          zoomOnScroll={true}
          defaultEdgeOptions={{ type: "smoothstep" }}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      {editingTask && (
        <div className="absolute right-0 top-0 h-full w-96 bg-background border-l border-border p-0 overflow-hidden z-50 flex flex-col shadow-2xl">
          {/* HEADER - Tech Slate Style */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-card/30">
            <div className="flex flex-col">
              <h2 className="font-mono font-bold text-sm tracking-tighter uppercase text-accent">
                Edit Step
              </h2>
            </div>

            <Button
              onClick={() => setEditingTask(null)}
              variant="ghost"
              className="p-1 rounded-none hover:bg-accent hover:text-accent-foreground transition-colors h-8 w-8 border border-transparent hover:border-accent"
            >
              ✕
            </Button>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="h-full px-6">
              <div className="space-y-8 py-6">
                {/* 01. TASK NAME */}
                <div className="space-y-2 group">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground group-focus-within:text-accent transition-colors">
                    01. Task Name
                  </Label>
                  <Input
                    className="w-full bg-card border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-sm"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                  />
                </div>

                {/* 02. FOLDER */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    02. Namespace / Folder
                  </Label>
                  <Input
                    className="w-full bg-card border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-sm opacity-60"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                  />
                </div>

                {/* 03. TYPE SELECTOR */}
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    03. Execution Type
                  </Label>
                  <div className="flex p-1 bg-card border border-border/20 gap-1">
                    <Button
                      onClick={() => setTaskType("job")}
                      className={`flex-1 rounded-none font-mono text-xs h-8 ${
                        taskType === "job"
                          ? "bg-accent text-accent-foreground shadow-[0_0_10px_rgba(225,244,243,0.3)]"
                          : "bg-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      JOB
                    </Button>
                    <Button
                      onClick={() => setTaskType("service")}
                      className={`flex-1 rounded-none font-mono text-xs h-8 ${
                        taskType === "service"
                          ? "bg-accent text-accent-foreground shadow-[0_0_10px_rgba(225,244,243,0.3)]"
                          : "bg-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      SERVICE
                    </Button>
                  </div>
                </div>

                {/* 04. COMMAND */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    04. Shell Command
                  </Label>
                  <div className="relative">
                    <Textarea
                      className="w-full bg-black border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-xs min-h-[100px] p-3 leading-relaxed text-emerald-400/90"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                    />
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  </div>
                </div>

                {/* RETRIES & TIMEOUT */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      Execution Retries
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      className="w-full bg-card border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-sm"
                      value={retries}
                      onChange={(e) => setRetries(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      Timeout (seconds)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      className="w-full bg-card border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-sm"
                      value={timeoutVal}
                      onChange={(e) => setTimeoutVal(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 60"
                    />
                  </div>
                </div>

                {/* ENV VARIABLES */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Environment Variables
                  </Label>
                  <Textarea
                    className="w-full bg-black border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-xs min-h-[80px] p-3 leading-relaxed text-blue-400"
                    value={envStr}
                    onChange={(e) => setEnvStr(e.target.value)}
                    placeholder="KEY=VALUE&#10;PORT=8080"
                  />
                  <span className="text-[9px] text-muted-foreground block font-mono">
                    Enter one env variable per line. Format: KEY=VALUE
                  </span>
                </div>

                {/* 05. LOG RULES (Sync with Add Panel Design) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      05. Log Rules (Highlights)
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newRule = {
                          id: crypto.randomUUID(),
                          label: "",
                          match: "",
                          enabled: true,
                          isRegex: false,
                          color: "#10b981",
                        };
                        const updatedRules = [
                          ...(editingTask.logRules || []),
                          newRule,
                        ];
                        setEditingTask({
                          ...editingTask,
                          logRules: updatedRules,
                        });
                      }}
                      className="h-6 text-[9px] font-mono border border-border/40 rounded-none hover:bg-accent"
                    >
                      + ADD RULE
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(editingTask.logRules || []).map((rule) => (
                      <div
                        key={rule.id}
                        className="space-y-4 border-l-2 border-accent/30 pl-4 py-3 bg-accent/5 relative group"
                      >
                        <button
                          onClick={() => {
                            const filtered = editingTask.logRules?.filter(
                              (r) => r.id !== rule.id,
                            );
                            setEditingTask({
                              ...editingTask,
                              logRules: filtered,
                            });
                          }}
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X size={14} />
                        </button>

                        <div className="grid grid-cols-[1fr_40px] gap-3">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-accent/70 uppercase">
                                Rule Label
                              </span>
                              <Input
                                placeholder="e.g. ERROR"
                                className="h-8 text-[10px] font-mono rounded-none bg-card border-border/40 focus-visible:border-accent"
                                value={rule.label}
                                onChange={(e) => {
                                  const updated = editingTask.logRules?.map(
                                    (r) =>
                                      r.id === rule.id
                                        ? { ...r, label: e.target.value }
                                        : r,
                                  );
                                  setEditingTask({
                                    ...editingTask,
                                    logRules: updated,
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-accent/70 uppercase">
                                Pattern Match
                              </span>
                              <Input
                                placeholder="Pattern..."
                                className="h-8 text-[10px] font-mono rounded-none bg-card border-border/40 focus-visible:border-accent"
                                value={rule.match as string}
                                onChange={(e) => {
                                  const updated = editingTask.logRules?.map(
                                    (r) =>
                                      r.id === rule.id
                                        ? { ...r, match: e.target.value }
                                        : r,
                                  );
                                  setEditingTask({
                                    ...editingTask,
                                    logRules: updated,
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col justify-end pb-1">
                            <span className="text-[9px] font-mono text-accent/70 uppercase mb-1">
                              Color
                            </span>
                            <input
                              type="color"
                              value={rule.color}
                              onChange={(e) => {
                                const updated = editingTask.logRules?.map(
                                  (r) =>
                                    r.id === rule.id
                                      ? { ...r, color: e.target.value }
                                      : r,
                                );
                                setEditingTask({
                                  ...editingTask,
                                  logRules: updated,
                                });
                              }}
                              className="w-full h-8 bg-transparent border border-border/40 cursor-pointer p-0.5"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground cursor-pointer hover:text-accent transition-colors">
                          <input
                            type="checkbox"
                            className="accent-accent w-3 h-3"
                            checked={rule.isRegex}
                            onChange={(e) => {
                              const updated = editingTask.logRules?.map((r) =>
                                r.id === rule.id
                                  ? { ...r, isRegex: e.target.checked }
                                  : r,
                              );
                              setEditingTask({
                                ...editingTask,
                                logRules: updated,
                              });
                            }}
                          />
                          ENABLE_REGEX_PARSING
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HEALTH CHECK CONDITION */}
                {taskType === "service" && (
                  <div className="space-y-3">
                    {" "}
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      06. Health Check Condition
                    </Label>
                    <div className="space-y-4 border-l-2 border-accent/30 pl-4 py-2 bg-accent/5">
                      <Select
                        value={readyKind}
                        onValueChange={(value) => setReadyKind(value as any)}
                      >
                        <SelectTrigger className="w-full bg-card border-border/40 rounded-none font-mono text-xs">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-border/40 bg-card font-mono text-xs">
                          <SelectItem value="exit">Wait for Exit</SelectItem>
                          <SelectItem value="port">Listen on Port</SelectItem>
                          <SelectItem value="log">Parse Log Stream</SelectItem>
                        </SelectContent>
                      </Select>

                      {readyKind === "port" && (
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            PORT:
                          </span>
                          <Input
                            type="number"
                            className="flex-1 bg-card border-border/40 rounded-none h-8 font-mono text-sm"
                            value={readyPort}
                            onChange={(e) =>
                              setReadyPort(Number(e.target.value))
                            }
                          />
                        </div>
                      )}

                      {readyKind === "log" && (
                        <div className="space-y-3">
                          <Input
                            className="w-full bg-card border-border/40 rounded-none h-8 font-mono text-xs"
                            value={readyLogMatch}
                            onChange={(e) => setReadyLogMatch(e.target.value)}
                            placeholder="Pattern string..."
                          />
                          <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground cursor-pointer hover:text-accent transition-colors">
                            <input
                              type="checkbox"
                              className="accent-accent w-3 h-3"
                              checked={logMatchType === "regex"}
                              onChange={(e) =>
                                setLogMatchType(
                                  e.target.checked ? "regex" : "text",
                                )
                              }
                            />
                            ENABLE_REGEX_PARSING
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-px bg-border/20 border-t border-border/20">
            <Button
              variant="ghost"
              className="rounded-none h-14 bg-card text-red-400 hover:bg-red-950/30 font-mono text-xs uppercase tracking-widest"
              onClick={() => setEditingTask(null)}
            >
              CANCEL
            </Button>

            <Button
              className="rounded-none h-14 bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50"
              onClick={handleUpdateTask}
              disabled={updateTaskMutation.isPending}
            >
              {updateTaskMutation.isPending ? "Syncing..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
