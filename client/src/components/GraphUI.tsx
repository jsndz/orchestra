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
} from "reactflow";
import "reactflow/dist/style.css";

import { Dependency, ReadyWhen, Task } from "../types";
import { useCallback, useEffect, useState } from "react";
import {
  useDeleteTask,
  useDeleteDependency,
  useAddDependency,
  useUpdateTask,
} from "../hooks/useTasks";
import { analyze } from "../api/tasks";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
      nodes.push({
        id: task.id,
        type: "default",
        position: {
          x: levelIndex * horizontalSpacing,
          y: startY + i * verticalSpacing,
        },
        data: {
          label: (
            <div className="text-left">
              <div className="font-semibold text-slate-800">{task.task}</div>
              <div className="text-xs text-slate-500">{task.folder}</div>

              {task.type === "service" && (
                <div className="text-[10px] mt-1 px-2 py-0.5 inline-block bg-blue-100 text-blue-600 rounded">
                  service
                </div>
              )}

              {task.command && (
                <div className="text-xs text-slate-400 mt-1 truncate">
                  {task.command}
                </div>
              )}
            </div>
          ),
        },
        style: {
          border: "2px solid #2563eb",
          borderRadius: "10px",
          background: "#ffffff",
          padding: "10px",
          width: 240,
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
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
      color: "#2563eb",
    },
    style: {
      stroke: "#2563eb",
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
  useEffect(() => {
    if (!editingTask) return;

    setTaskName(editingTask.task);
    setFolderName(editingTask.folder);
    setCommand(editingTask.command ?? "");
    setTaskType(editingTask.type);

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

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      addDependencyMutation.mutate({
        from: params.source,
        to: params.target,
      });
    },
    [addDependencyMutation],
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

    updateTaskMutation.mutate({
      id: editingTask.id,
      updates: {
        task: taskName,
        folder: folderName,
        command,
        type: taskType,
        ready,
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onNodeClick={onNodeClick}
          onConnect={onConnect}
          fitView
          nodesDraggable
          elementsSelectable
          nodesConnectable
          deleteKeyCode={["Backspace", "Delete"]}
          panOnScroll
          zoomOnScroll
          defaultEdgeOptions={{ type: "smoothstep" }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {editingTask && (
        <div className="absolute right-0 top-0 h-full w-96 bg-background border-l p-6 overflow-y-auto z-50 flex flex-col">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Edit Step</h2>

            <Button
              onClick={() => setEditingTask(null)}
              variant="ghost"
              className="p-1 rounded hover:bg-muted h-7 w-7"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-5 flex-1">
            {/* TASK NAME */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Task Name
              </Label>
              <Input
                className="w-full border p-2 rounded"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>

            {/* FOLDER */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Folder
              </Label>
              <Input
                className="w-full border p-2 rounded"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </div>

            {/* COMMAND */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Command
              </Label>
              <Textarea
                className="w-full border p-2 rounded resize-none"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                rows={3}
              />
            </div>

            {/* TYPE */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Step Type
              </Label>

              <div className="flex gap-2">
                <Button
                  onClick={() => setTaskType("job")}
                  variant={taskType === "job" ? "default" : "outline"}
                  className="flex-1"
                >
                  JOB
                </Button>
                <Button
                  onClick={() => setTaskType("service")}
                  variant={taskType === "service" ? "default" : "outline"}
                  className="flex-1"
                >
                  SERVICE
                </Button>
              </div>
            </div>

            {/* READY CONDITION */}
            {taskType === "service" && (
              <div className="space-y-3 border rounded p-3">
                <Label className="text-sm font-medium text-muted-foreground">
                  Ready Condition
                </Label>

                <Select
                  value={readyKind}
                  onValueChange={(value) =>
                    setReadyKind(value as "exit" | "port" | "log")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select ready condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exit">Process exits</SelectItem>
                    <SelectItem value="port">Port open</SelectItem>
                    <SelectItem value="log">Log match</SelectItem>
                  </SelectContent>
                </Select>

                {readyKind === "port" && (
                  <Input
                    type="number"
                    className="w-full border p-2 rounded"
                    value={readyPort}
                    onChange={(e) => setReadyPort(Number(e.target.value))}
                    placeholder="Port number"
                  />
                )}

                {readyKind === "log" && (
                  <div className="space-y-2">
                    <Input
                      className="w-full border p-2 rounded"
                      value={readyLogMatch}
                      onChange={(e) => setReadyLogMatch(e.target.value)}
                      placeholder={
                        logMatchType === "regex"
                          ? "e.g. server.*started"
                          : "e.g. server started"
                      }
                    />

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={logMatchType === "regex"}
                        onChange={(e) =>
                          setLogMatchType(e.target.checked ? "regex" : "text")
                        }
                      />
                      Use regex
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between pt-6 border-t mt-6">
            <Button
              variant="destructive"
              onClick={() => {
                deleteTaskMutation.mutate(editingTask.id);
                setEditingTask(null);
              }}
            >
              Delete
            </Button>

            <Button
              onClick={handleUpdateTask}
              disabled={updateTaskMutation.isPending}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
