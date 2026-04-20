import { useState } from "react";
import {
  Plus,
  ListTodo,
  Link,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { useAddTask, useAddDependency } from "../hooks/useTasks";
import { TaskRequest } from "../types";
import DependencyForm from "./DependencyForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function WorkflowControls({ tasks, dependencies }: any) {
  const addTask = useAddTask();
  const addDep = useAddDependency();

  const [mode, setMode] = useState<"none" | "add" | "new" | "link">("none");

  const [taskName, setTaskName] = useState("");
  const [taskFolder, setTaskFolder] = useState("");
  const [taskCommand, setTaskCommand] = useState("");

  const [taskType, setTaskType] = useState<"job" | "service">("job");
  const [readyIsRegex, setReadyIsRegex] = useState(false);
  const [readyKind, setReadyKind] = useState<"none" | "port" | "log">("none");
  const [readyPort, setReadyPort] = useState("");
  const [readyLog, setReadyLog] = useState("");

  const [lastTaskId, setLastTaskId] = useState<string | null>(null);

  const handlePickFolder = async () => {
    const fullPath = await window.api.selectFolder();
    if (fullPath) setTaskFolder(fullPath);
  };

  const handleAddTask = () => {
    if (!taskName.trim()) return;

    let ready: TaskRequest["ready"] | undefined;

    if (taskType === "service") {
      if (readyKind === "port" && readyPort) {
        ready = { kind: "port", port: Number(readyPort) };
      }

      if (readyKind === "log" && readyLog.trim()) {
        ready = { kind: "log", match: readyLog, isRegex: readyIsRegex };
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

            <div className="flex gap-2">
              <Input
                placeholder="Working directory"
                value={taskFolder}
                readOnly
              />
              <Button type="button" variant="outline" onClick={handlePickFolder}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>

            <Input
              placeholder="Command"
              value={taskCommand}
              onChange={(e) => setTaskCommand(e.target.value)}
            />

            {/* Task Type */}
            <Select
              value={taskType}
              onValueChange={(value) => setTaskType(value as "job" | "service")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job">Job (finite)</SelectItem>
                <SelectItem value="service">Service (long running)</SelectItem>
              </SelectContent>
            </Select>

            {/* Readiness (only for service) */}
            {taskType === "service" && (
              <>
                <Select
                  value={readyKind}
                  onValueChange={(value) =>
                    setReadyKind(value as "none" | "port" | "log")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select readiness condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No readiness</SelectItem>
                    <SelectItem value="port">Ready on Port</SelectItem>
                    <SelectItem value="log">Ready on Log</SelectItem>
                  </SelectContent>
                </Select>

                {readyKind === "port" && (
                  <Input
                    placeholder="Port number (e.g. 3000)"
                    value={readyPort}
                    onChange={(e) => setReadyPort(e.target.value)}
                  />
                )}

                {readyKind === "log" && (
                  <>
                    <Input
                      placeholder='Log match (e.g. "Server started")'
                      value={readyLog}
                      onChange={(e) => setReadyLog(e.target.value)}
                    />

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={readyIsRegex}
                        onChange={(e) => setReadyIsRegex(e.target.checked)}
                      />
                      Use regex
                    </label>
                  </>
                )}
              </>
            )}

            <Button
              className="w-full"
              onClick={() => handleAddTask()}
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


          <Button variant="outline" onClick={() => setMode("link")}>
            <Link className="h-4 w-4 mr-2" />
            Link Steps
          </Button>
        </div>
      </div>
    </div>
  );
}
