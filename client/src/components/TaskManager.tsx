import { useState } from "react";
import {
  Plus,
  Link2,
  Loader2,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

import { useAddTask, useAddDependency } from "../hooks/useTasks";
import { TaskRequest, Task, Dependency, ReadyWhen } from "../types";

export default function WorkflowControls({
  tasks,
  dependencies,
}: {
  tasks: Task[];
  dependencies: Dependency[];
}) {
  const addTask = useAddTask();
  const addDep = useAddDependency();

  const [mode, setMode] = useState<"none" | "add" | "link">("none");

  // --- Task Form State ---
  const [taskName, setTaskName] = useState("");
  const [taskFolder, setTaskFolder] = useState("");
  const [taskCommand, setTaskCommand] = useState("");
  const [taskType, setTaskType] = useState<"job" | "service">("job");

  // ReadyWhen State
  const [readyKind, setReadyKind] = useState<"exit" | "port" | "log">("exit");
  const [readyPort, setReadyPort] = useState("");
  const [readyLog, setReadyLog] = useState("");
  const [readyIsRegex, setReadyIsRegex] = useState(false);

  // --- Dependency Form State ---
  const [depFrom, setDepFrom] = useState("");
  const [depTo, setDepTo] = useState("");

  const handlePickFolder = async () => {
    const fullPath = await window.api.selectFolder();
    if (fullPath) setTaskFolder(fullPath);
  };

  const handleAddTask = () => {
    if (!taskName.trim()) return;

    let ready: ReadyWhen;
    if (taskType === "job") {
      ready = { kind: "exit" };
    } else {
      if (readyKind === "port") {
        ready = { kind: "port", port: Number(readyPort) || 0 };
      } else if (readyKind === "log") {
        ready = { kind: "log", match: readyLog, isRegex: readyIsRegex };
      } else {
        ready = { kind: "exit" };
      }
    }

    const payload: TaskRequest = {
      task: taskName,
      folder: taskFolder,
      command: taskCommand,
      type: taskType,
      ready,
    };

    addTask.mutate(payload, {
      onSuccess: () => {
        setTaskName("");
        setTaskFolder("");
        setTaskCommand("");
        setTaskType("job");
        setReadyKind("exit");
        setMode("none");
      },
    });
  };

  const handleAddDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depFrom || !depTo || depFrom === depTo) return;
    addDep.mutate(
      { from: depFrom, to: depTo },
      {
        onSuccess: () => {
          setDepFrom("");
          setDepTo("");
        },
      },
    );
  };

  const techHeaderStyle =
    "flex justify-between px-6 py-4 border-b border-border/20 bg-card/30 items-center";

  return (
    <div className="flex flex-col items-center p-8">
      <div className="relative">
        {/* --- ADD TASK PANEL --- */}
        {mode === "add" && (
          <Card className="absolute bottom-full mb-8 w-[420px] bg-background border border-border/60 rounded-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header — matches Edit Step */}
            <div className={techHeaderStyle}>
              <div className="flex flex-col">
                <h2 className="font-mono font-bold text-sm tracking-tighter uppercase text-accent">
                  Add Step
                </h2>
              </div>
              <Button
                onClick={() => setMode("none")}
                variant="ghost"
                className="p-1 rounded-none hover:bg-accent hover:text-accent-foreground transition-colors h-8 w-8 border border-transparent hover:border-accent"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-8 px-6 py-6">
              {/* 01. Task Name */}
              <div className="space-y-2 group">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground group-focus-within:text-accent transition-colors">
                  01. Task Name
                </Label>
                <Input
                  className="w-full bg-card border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-sm"
                  placeholder="e.g. API_GATEWAY"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
              </div>

              {/* 02. Namespace / Folder */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  02. Namespace / Folder
                </Label>
                <div className="flex gap-px">
                  <Input
                    className="w-full bg-card border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-sm opacity-70"
                    value={taskFolder}
                    readOnly
                    placeholder="/root/project"
                  />
                  <Button
                    variant="secondary"
                    className="rounded-none h-10 border-l-0 border-border/40 hover:bg-accent hover:text-background"
                    onClick={handlePickFolder}
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 03. Execution Type */}
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

              {/* 04. Shell Command */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  04. Shell Command
                </Label>
                <div className="relative">
                  <Textarea
                    className="w-full bg-black border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-xs min-h-[100px] p-3 leading-relaxed text-emerald-400/90"
                    value={taskCommand}
                    onChange={(e) => setTaskCommand(e.target.value)}
                    placeholder="npm run dev"
                  />
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </div>
              </div>

              {/* Health Check Condition — service only, matches Edit Step exactly */}
              {taskType === "service" && (
                <div className="space-y-4 border-l-2 border-accent/30 pl-4 py-2 bg-accent/5">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-accent">
                    Health Check Condition
                  </Label>

                  <Select
                    value={readyKind}
                    onValueChange={(value) =>
                      setReadyKind(value as "exit" | "port" | "log")
                    }
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
                        onChange={(e) => setReadyPort(e.target.value)}
                        placeholder="3000"
                      />
                    </div>
                  )}

                  {readyKind === "log" && (
                    <div className="space-y-3">
                      <Input
                        className="w-full bg-card border-border/40 rounded-none h-8 font-mono text-xs"
                        value={readyLog}
                        onChange={(e) => setReadyLog(e.target.value)}
                        placeholder="Pattern string..."
                      />
                      <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground cursor-pointer hover:text-accent transition-colors">
                        <input
                          type="checkbox"
                          className="accent-accent"
                          checked={readyIsRegex}
                          onChange={(e) => setReadyIsRegex(e.target.checked)}
                        />
                        ENABLE_REGEX_PARSING
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer — matches Edit Step pinned action bar */}
            <div className="grid grid-cols-1 gap-px bg-border/20 border-t border-border/20">
              <Button
                className="rounded-none h-14 bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50"
                onClick={handleAddTask}
                disabled={addTask.isPending}
              >
                {addTask.isPending ? "Syncing..." : "Commit Step"}
              </Button>
            </div>
          </Card>
        )}

        {/* --- LINK DEPENDENCY PANEL --- */}
        {mode === "link" && (
          <Card className="absolute bottom-full mb-8 w-[420px] bg-background border border-border/60 rounded-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className={techHeaderStyle}>
              <div className="flex flex-col">
                <h2 className="font-mono font-bold text-sm tracking-tighter uppercase text-accent">
                  Link Graph
                </h2>
              </div>
              <Button
                onClick={() => setMode("none")}
                variant="ghost"
                className="p-1 rounded-none hover:bg-accent hover:text-accent-foreground transition-colors h-8 w-8 border border-transparent hover:border-accent"
              >
                ✕
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <form onSubmit={handleAddDependency} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Select value={depFrom} onValueChange={setDepFrom}>
                    <SelectTrigger className="flex-1 bg-card border-border/40 rounded-none h-9 font-mono text-[11px]">
                      <SelectValue placeholder="SOURCE" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/40 rounded-none">
                      {tasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.task}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <ArrowRight
                    size={14}
                    className="text-accent shrink-0 animate-pulse"
                  />

                  <Select value={depTo} onValueChange={setDepTo}>
                    <SelectTrigger className="flex-1 bg-card border-border/40 rounded-none h-9 font-mono text-[11px]">
                      <SelectValue placeholder="DEPENDENT" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/40 rounded-none">
                      {tasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.task}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={!depFrom || !depTo || depFrom === depTo || addDep.isPending}
                  className="w-full rounded-none bg-accent text-background font-bold h-9 text-[11px] uppercase"
                >
                  {addDep.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Link Nodes"}
                </Button>
              </form>
            </div>
          </Card>
        )}

        {/* --- MAIN CONTROL BAR --- */}
        <div className="flex bg-black p-1 border border-border/40 shadow-xl">
          <Button
            variant="ghost"
            className={`rounded-none font-bold uppercase tracking-tighter text-xs px-6 h-10 transition-none ${
              mode === "add"
                ? "bg-accent text-background"
                : "text-muted-foreground hover:text-accent"
            }`}
            onClick={() => setMode(mode === "add" ? "none" : "add")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>

          <div className="w-[1px] bg-border/20 mx-1" />

          <Button
            variant="ghost"
            className={`rounded-none font-bold uppercase tracking-tighter text-xs px-6 h-10 transition-none ${
              mode === "link"
                ? "bg-accent text-background"
                : "text-muted-foreground hover:text-accent"
            }`}
            onClick={() => setMode(mode === "link" ? "none" : "link")}
          >
            <Link2 className="h-4 w-4 mr-2" />
            Link Graph
          </Button>
        </div>
      </div>
    </div>
  );
}
