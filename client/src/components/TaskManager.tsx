import { useState } from "react";
import { Plus, ListTodo, Link, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { useAddTask, useAddDependency } from "../hooks/useTasks";
import { TaskRequest } from "../types";
import DependencyForm from "./DependencyForm";

export default function WorkflowControls({ tasks, dependencies }: any) {
  const addTask = useAddTask();
  const addDep = useAddDependency();

  const [mode, setMode] = useState<"none" | "add" | "new" | "link">("none");
  const [newFlow, setNewflow] = useState<boolean>(true);

  const [taskName, setTaskName] = useState("");
  const [taskFolder, setTaskFolder] = useState("");
  const [taskCommand, setTaskCommand] = useState("");

  const [taskType, setTaskType] = useState<"job" | "service">("job");

  const [readyKind, setReadyKind] = useState<"none" | "port" | "log">("none");
  const [readyPort, setReadyPort] = useState("");
  const [readyLog, setReadyLog] = useState("");

  const [lastTaskId, setLastTaskId] = useState<string | null>(null);

  const handleAddTask = (isNewWorkflow: boolean) => {
    if (!taskName.trim()) return;

    let ready: TaskRequest["ready"] | undefined;

    if (taskType === "service") {
      if (readyKind === "port" && readyPort) {
        ready = { kind: "port", port: Number(readyPort) };
      }

      if (readyKind === "log" && readyLog.trim()) {
        ready = { kind: "log", match: readyLog };
      }
    }

    const task: TaskRequest = {
      task: taskName,
      folder: taskFolder,
      command: taskCommand,
      type: taskType,
      ready,
    };

    addTask.mutate(task, {
      onSuccess: (newTask) => {
        if (!isNewWorkflow && lastTaskId) {
          addDep.mutate({
            from: lastTaskId,
            to: newTask.id,
          });
        }
        setLastTaskId(newTask.id);
      },
    });

    // reset
    setTaskName("");
    setTaskFolder("");
    setTaskCommand("");
    setTaskType("job");
    setReadyKind("none");
    setReadyPort("");
    setReadyLog("");
    setNewflow(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">

        {(mode === "add" || mode === "new") && (
          <Card className="absolute bottom-full mb-4 w-96 p-4 space-y-3 shadow-xl bg-card/95 backdrop-blur-sm">
            <Button variant="ghost" size="sm" onClick={() => setMode("none")}>
              ← Back
            </Button>

            <Input
              placeholder="Step name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />

            <Input
              placeholder="Working directory"
              value={taskFolder}
              onChange={(e) => setTaskFolder(e.target.value)}
            />

            <Input
              placeholder="Command"
              value={taskCommand}
              onChange={(e) => setTaskCommand(e.target.value)}
            />

            {/* Task Type */}
            <select
              className="w-full border rounded px-2 py-1"
              value={taskType}
              onChange={(e) =>
                setTaskType(e.target.value as "job" | "service")
              }
            >
              <option value="job">Job (finite)</option>
              <option value="service">Service (long running)</option>
            </select>

            {/* Readiness (only for service) */}
            {taskType === "service" && (
              <>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={readyKind}
                  onChange={(e) =>
                    setReadyKind(e.target.value as any)
                  }
                >
                  <option value="none">No readiness</option>
                  <option value="port">Ready on Port</option>
                  <option value="log">Ready on Log</option>
                </select>

                {readyKind === "port" && (
                  <Input
                    placeholder="Port number (e.g. 3000)"
                    value={readyPort}
                    onChange={(e) => setReadyPort(e.target.value)}
                  />
                )}

                {readyKind === "log" && (
                  <Input
                    placeholder='Log match (e.g. "Server started")'
                    value={readyLog}
                    onChange={(e) => setReadyLog(e.target.value)}
                  />
                )}
              </>
            )}

            <Button
              className="w-full"
              onClick={() => handleAddTask(mode === "new")}
              disabled={addTask.isPending}
            >
              {addTask.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </>
              )}
            </Button>
          </Card>
        )}

        {mode === "link" && (
          <Card className="absolute bottom-full mb-4 w-96 shadow-xl bg-card/95 backdrop-blur-sm">
            <DependencyForm
              tasks={tasks}
              dependencies={dependencies}
              onBack={() => setMode("none")}
            />
          </Card>
        )}

        <div className="flex gap-2 bg-card/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
          <Button onClick={() => setMode("add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>

          <Button
            onClick={() => {
              setLastTaskId(null);
              setMode("new");
              setNewflow(true);
            }}
            variant={newFlow ? "link" : "secondary"}
          >
            <ListTodo className="h-4 w-4 mr-2" />
            New Workflow
          </Button>

          <Button variant="outline" onClick={() => setMode("link")}>
            <Link className="h-4 w-4 mr-2" />
            Link Workflow
          </Button>
        </div>
      </div>
    </div>
  );
}