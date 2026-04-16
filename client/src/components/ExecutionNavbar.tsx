import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useWorkflowStore } from "../store/useAppStore";
import { useState } from "react";
import { Input } from "./ui/input";

type Props = {
  onStop: () => void;
  onRestart: () => void;
  onCreateYaml: () => void;
  status: "idle" | "loading" | "stopped";
};

export default function ExecutionNavbar({
  onStop,
  onRestart,
  onCreateYaml,
  status,
}: Props) {
  const workflowName = useWorkflowStore((s) => s.workflowName);

  const navigate = useNavigate();
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const [editingName, setEditingName] = useState(false);

  const getButtonText = () => {
    if (status === "loading") return "Stopping...";
    if (status === "stopped") return "Stopped";
    return "Stop";
  };

  return (
    <div className="w-full flex justify-between items-center px-4 h-16 border-b border-zinc-800 bg-zinc-950">
      {/* LOGO */}
      <div className="flex items-center space-x-2">
        <img src="./logo.png" alt="logo" width={180} />
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

      {/* ACTIONS */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Tasks
        </Button>

        <Button variant="outline" onClick={() => navigate("/report")}>
          Report
        </Button>

        <Button
          onClick={onRestart}
          variant="outline"
          disabled={status === "loading"}
        >
          Restart
        </Button>

        <Button
          onClick={onStop}
          disabled={status === "loading" || status === "stopped"}
          variant={status === "stopped" ? "secondary" : "destructive"}
        >
          {getButtonText()}
        </Button>

        <Button
          onClick={() => {
            console.log("clicking");
            
            onCreateYaml();
          }}
        >
          Create YAML
        </Button>
      </div>
    </div>
  );
}
