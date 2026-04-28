import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

import { Dependency, Task } from "../types";
import { useEffect, useRef, useState } from "react";
import { analyze } from "../api/tasks";
import ExecNode from "./ExecNode";

const nodeTypes = {
  custom: ExecNode,
};

function toReactFlowGraphFromLevels(
  levels: Task[][],
  deps: Dependency[],
  selectedId: string | null,
  allTasks: Task[]
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
        type: "custom",
        position: { x: levelIndex * horizontalSpacing, y: startY + i * verticalSpacing },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: task.task,
          subLabel: task.folder,
          type: task.type,
          command: task.command,
          state: task.state,
          isSelected: task.id === selectedId,
        },
      });
    });
  });

  const edges: Edge[] = deps.map((d) => {
    const source = allTasks.find((t) => t.id === d.from);
    const dest = allTasks.find((t) => t.id === d.to);


    let edgeColor = "#4b5563";
    let animated = false;

    if (source?.state === "failed") {
      edgeColor = "#ef4444"; 
    } 
    else if (dest?.state === "completed") {
      edgeColor = "#22c55e";
    }
    else if (source?.state === "completed" || source?.state === "ready") {
      edgeColor = "#22c55e"; 
    } 
    else if (source?.state === "running" || source?.state === "starting") {
      edgeColor = "#3b82f6"; 
      animated = true;
    }

    return {
      id: `${d.from}->${d.to}`,
      source: d.from,
      target: d.to,
      type: "smoothstep",
      animated,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeColor,
      },
      style: {
        stroke: edgeColor,
        strokeWidth: source?.state === "failed" ? 3 : 2,
        transition: "stroke 0.5s ease, stroke-width 0.5s ease",
      },
    };
  });

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
  
  const rfInstance = useRef<any>(null);

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
      apiData.tasks
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
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          rfInstance.current = instance;
        }}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1a1a1a" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}