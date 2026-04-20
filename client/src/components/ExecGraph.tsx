import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
  ReactFlowInstance,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { Dependency, StepState, Task } from "../types";
import { useEffect, useRef, useState } from "react";
import { analyze } from "../api/tasks";

function getStateStyle(state: StepState, isSelected: boolean) {
  const base = {
    borderRadius: "10px",
    padding: "10px",
    width: 240,
    color: "#ffffff",
    fontWeight: 500,
  };

  const styles: Record<StepState, any> = {
    idle: {
      background: "#9ca3af",
      border: "2px solid #6b7280",
    },

    starting: {
      background: "#f59e0b",
      border: "2px solid #d97706",
    },

    ready: {
      background: "#22c55e",
      border: "2px solid #16a34a",
    },

    running: {
      background: "#3b82f6",
      border: "2px solid #2563eb",
    },

    completed: {
      background: "#15803d",
      border: "2px solid #166534",
    },

    failed: {
      background: "#ef4444",
      border: "2px solid #b91c1c",
    },

    stopped: {
      background: "#6b7280",
      border: "2px solid #4b5563",
    },
  };

  const selected = isSelected
    ? { boxShadow: "0 0 0 5px rgba(0,0,0,0.25)" }
    : {};

  return { ...base, ...styles[state], ...selected };
}

function toReactFlowGraphFromLevels(
  levels: Task[][],
  deps: Dependency[],
  selectedId: string | null,
) {
  const horizontalSpacing = 400; 
  const verticalSpacing = 160;

  const nodes: Node[] = [];

  levels.forEach((levelTasks, levelIndex) => {
    const totalHeight = levelTasks.length * verticalSpacing;
    const startY = -totalHeight / 2;

    levelTasks.forEach((task, i) => {
      const isSelected = task.id === selectedId;

      nodes.push({
        id: task.id,
        position: {
          x: levelIndex * horizontalSpacing,
          y: startY + i * verticalSpacing,
        },
        data: {
          label: (
            <div>
              <div className="font-semibold">{task.task}</div>
              <div className="text-xs text-muted-foreground">{task.folder}</div>
            </div>
          ),
        },
        style: getStateStyle(task.state, isSelected),
      });
    });
  });

  const edges: Edge[] = deps.map((d) => ({
    id: `${d.from}->${d.to}`,
    source: d.from,
    target: d.to,
    type: "smoothstep",
    animated: true,
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

export function ExecGraph({
  apiData,
  selectedId,
  onNodeClick,
}: {
  apiData: { tasks: Task[]; dependencies: Dependency[] };
  selectedId: string | null;
  onNodeClick: (id: string) => void;
}) {
  const [levels, setLevels] = useState<Task[][]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const rfInstance =  useRef<any>(null);

  useEffect(() => {
    analyze("parallel").then((res) => {
      if (res.ok) setLevels(res.levels);
    });
  }, [apiData.tasks, apiData.dependencies]);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = toReactFlowGraphFromLevels(
      levels,
      apiData.dependencies,
      selectedId,
    );

    setNodes(newNodes);
    setEdges(newEdges);

    if (rfInstance.current && newNodes.length > 0) {
      setTimeout(() => {
        rfInstance.current.fitView({ padding: 0.2 });
      }, 50);
    }
  }, [levels, apiData.tasks, selectedId]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        // 3. Capture the instance here
        onInit={(instance) => {
          rfInstance.current = instance;
        }}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        onNodeClick={(_, node) => onNodeClick(node.id)}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}