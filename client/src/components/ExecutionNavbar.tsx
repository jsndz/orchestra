import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useWorkflowStore } from "../store/useAppStore";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { useTerminalStore } from "../store/useTerminalStore";

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
  const removeAllTerminals = useTerminalStore((s) => s.removeAllTerminals);
  const [editingName, setEditingName] = useState(false);
  const [globalState, setGlobalState] = useState<
    "idle" | "running" | "completed" | "failed" | "stopped"
  >("idle");
  const getButtonText = () => {
    if (status === "loading") return "Stopping...";
    if (status === "stopped") return "Stopped";
    return "Stop";
  };
  useEffect(() => {
    window.api.onGlobalStateChange((state) => {
      console.log("Global State Changed:", state);
      setGlobalState(state);
    });
  }, []);
  return (
    <div className="w-full flex justify-between items-center px-4 h-16 border-b border-zinc-800 bg-zinc-950">
      {/* LOGO */}
      <div className="flex items-center space-x-2">
        <img src="./logo.png" alt="logo" width={100} height={100}/>
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
        <div>
          <span
            className={`ml-4 px-2 py-1 rounded text-xs font-medium ${
              globalState === "running"
                ? "bg-green-500 text-white"
                : globalState === "failed"
                  ? "bg-red-500 text-white"
                  : globalState === "completed"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-500 text-white"
            }`}
          >
            {globalState.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        {(globalState === "failed" ||
          globalState === "completed" ||
          globalState === "stopped") && (
          <Button
            variant="outline"
            onClick={() => {
              removeAllTerminals();
              navigate("/tasks");
            }}
          >
            Back to Tasks
          </Button>
        )}

        {/* <Button variant="outline" onClick={() => navigate("/report")}>
          Report
        </Button> */}

        <Button
          onClick={onRestart}
          variant="outline"
          disabled={status === "loading"}
        >
          Restart
        </Button>

        <Button
          onClick={() => {
            setGlobalState("stopped");
            onStop();
          }}
          disabled={status === "loading" || status === "stopped"}
          variant={status === "stopped" ? "secondary" : "destructive"}
        >
          {getButtonText()}
        </Button>

        <Button
          onClick={() => {
            onCreateYaml();
          }}
        >
          Create YAML
        </Button>
      </div>
    </div>
  );
}
