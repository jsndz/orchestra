import { useState } from "react";
import {
  Plus,
  Link2,
  Loader2,
  FolderOpen,
  ArrowRight,
  X,
  Check,
  Hash,
  Terminal,
  Activity,
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
import { TaskRequest, Task, Dependency, ReadyWhen, LogRule } from "../types";

export default function WorkflowControls({
  tasks,
  dependencies: _dependencies,
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
  const [logRules, setLogRules] = useState<LogRule[]>([]);

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

  const addLogRuleRow = () => {
    const newRule: LogRule = {
      id: crypto.randomUUID(),
      label: "",
      match: "",
      enabled: true,
      isRegex: false,
      color: "#10b981",
    };
    setLogRules([...logRules, newRule]);
  };

  const updateLogRule = (id: string, updates: Partial<LogRule>) => {
    setLogRules(logRules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const removeLogRule = (id: string) => {
    setLogRules(logRules.filter((r) => r.id !== id));
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

    addTask.mutate(
      {
        task: taskName,
        folder: taskFolder,
        command: taskCommand,
        type: taskType,
        ready,
        logRules: logRules.filter((r) => r.label && r.match),
      },
      {
        onSuccess: () => {
          setTaskName("");
          setTaskFolder("");
          setTaskCommand("");
          setLogRules([]);
          setMode("none");
        },
      },
    );
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
    "flex justify-between px-6 py-4 border-b border-border/20 bg-card/50 items-center backdrop-blur-md";
  const sectionLabelStyle =
    "text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3 flex items-center gap-2";
  const inputLabelStyle =
    "text-[9px] font-mono text-accent/50 uppercase mb-1.5 block";

  return (
    <div className="flex flex-col items-center p-8">
      <div className="relative">
        {/* --- ADD TASK PANEL --- */}
        {mode === "add" && (
          <Card className="absolute bottom-full mb-8 w-[520px] max-h-[75vh] flex flex-col bg-background border border-border/60 rounded-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={`sticky top-0 z-20 ${techHeaderStyle}`}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent animate-pulse" />
                <h2 className="font-mono font-bold text-sm tracking-tighter uppercase text-accent">
                  Add Step
                </h2>
              </div>
              <Button
                onClick={() => setMode("none")}
                variant="ghost"
                className="h-8 w-8 p-0 rounded-none hover:bg-destructive hover:text-white transition-all"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
              {/* SECTION: Base Metadata */}
              <section className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 group">
                    <Label className={sectionLabelStyle}>01. Task Name</Label>
                    <Input
                      className="w-full bg-card border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-sm"
                      placeholder="e.g. API_GATEWAY"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={sectionLabelStyle}>
                      03. Execution Type
                    </Label>
                    <div className="flex p-1 bg-black/40 border border-border/20 gap-1 h-10">
                      {(["job", "service"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTaskType(t)}
                          className={`flex-1 font-mono text-[10px] uppercase transition-all ${
                            taskType === t
                              ? "bg-accent text-background font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {t === "job" ? "JOB" : "SERVICE"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={sectionLabelStyle}>
                    02. Namespace / Folder
                  </Label>
                  <div className="flex gap-px">
                    <Input
                      className="bg-card border-border/40 rounded-none font-mono text-xs opacity-60 flex-1 h-10"
                      value={taskFolder}
                      readOnly
                      placeholder="/root/project"
                    />
                    <Button
                      variant="secondary"
                      className="rounded-none h-10 border-border/40 hover:bg-accent hover:text-background transition-colors"
                      onClick={handlePickFolder}
                    >
                      <FolderOpen size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={sectionLabelStyle}>04. Shell Command</Label>
                  <div className="relative">
                    <Textarea
                      className="bg-black border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-accent font-mono text-xs min-h-[100px] text-emerald-400/90"
                      value={taskCommand}
                      onChange={(e) => setTaskCommand(e.target.value)}
                      placeholder="npm run dev"
                    />
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  </div>
                </div>
              </section>

              {/* SECTION: Log Rules */}
              <section className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label className={sectionLabelStyle}>
                    05. Log Rules (Highlights)
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addLogRuleRow}
                    className="h-6 text-[9px] font-mono border-accent/40 text-accent rounded-none hover:bg-accent/10"
                  >
                    + ADD RULE
                  </Button>
                </div>

                <div className="space-y-3">
                  {logRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="border-l-2 border-accent/30 bg-accent/[0.03] p-4 space-y-4 relative group"
                    >
                      <button
                        onClick={() => removeLogRule(rule.id)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X size={14} />
                      </button>

                      <div className="grid grid-cols-[1fr_50px] gap-3">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className={inputLabelStyle}>Rule Label</span>
                            <Input
                              placeholder="e.g. ERROR_FOUND"
                              className="h-8 text-[10px] font-mono rounded-none bg-card border-border/40 focus-visible:border-accent"
                              value={rule.label}
                              onChange={(e) =>
                                updateLogRule(rule.id, {
                                  label: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <span className={inputLabelStyle}>
                              Pattern Match
                            </span>
                            <Input
                              placeholder="String or Regex pattern..."
                              className="h-8 text-[10px] font-mono rounded-none bg-card border-border/40 focus-visible:border-accent"
                              value={rule.match as string}
                              onChange={(e) =>
                                updateLogRule(rule.id, {
                                  match: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col justify-end pb-1">
                          <span className={inputLabelStyle}>Color</span>
                          <input
                            type="color"
                            value={rule.color}
                            onChange={(e) =>
                              updateLogRule(rule.id, { color: e.target.value })
                            }
                            className="w-full h-8 bg-transparent border border-border/40 cursor-pointer p-0.5"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground cursor-pointer hover:text-accent transition-colors">
                        <input
                          type="checkbox"
                          className="accent-accent w-3 h-3"
                          checked={rule.isRegex}
                          onChange={(e) =>
                            updateLogRule(rule.id, {
                              isRegex: e.target.checked,
                            })
                          }
                        />
                        ENABLE_REGEX_PARSING
                      </label>
                    </div>
                  ))}
                  {logRules.length === 0 && (
                    <div className="text-[10px] font-mono text-muted-foreground/50 italic text-center py-4 border border-dashed border-border/20 uppercase tracking-widest">
                      No custom log rules defined
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION: Health Check (Service Only) */}
              {taskType === "service" && (
                <section className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className={sectionLabelStyle}>
                    06. Health Check Condition
                  </Label>
                  <div className="border-l-2 border-accent/30 bg-accent/[0.03] p-4 space-y-4">
                    <Select
                      value={readyKind}
                      onValueChange={(v) => setReadyKind(v as any)}
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
                            className="accent-accent w-3 h-3"
                            checked={readyIsRegex}
                            onChange={(e) => setReadyIsRegex(e.target.checked)}
                          />
                          ENABLE_REGEX_PARSING
                        </label>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            <div className="p-1 bg-border/20 border-t border-border/20">
              <Button
                className="w-full rounded-none h-14 bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50"
                onClick={handleAddTask}
                disabled={addTask.isPending}
              >
                {addTask.isPending ? "Syncing..." : "Add Step"}
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
                  disabled={
                    !depFrom || !depTo || depFrom === depTo || addDep.isPending
                  }
                  className="w-full rounded-none bg-accent text-background font-bold h-9 text-[11px] uppercase"
                >
                  {addDep.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Link Nodes"
                  )}
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
