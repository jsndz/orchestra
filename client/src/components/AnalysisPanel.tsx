import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Network,
  TrendingUp,
  GitBranch,
  PlayCircle,
  Zap,
} from "lucide-react";

import { Card, CardContent } from "./ui/card";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

import { Task } from "../types";
import { analyze } from "../api/tasks";
import { useQuery } from "@tanstack/react-query";

export default function AnalysisPanel({ tasks }: { tasks: Task[] }) {
  const [selectedFailure, setSelectedFailure] = useState("");

  const { data: parallelData } = useQuery<{
    ok: boolean;
    levels: Task[][];
  }
  >({
    queryKey: ["parallel"],
    queryFn: () => analyze("parallel"),
  });
  console.log("parallel", parallelData);

  const { data: terminalData } = useQuery<string[]>({
    queryKey: ["terminal"],
    queryFn: () => analyze("terminal"),
  });
  console.log("terminal", terminalData);

  const { data: unreachableData } = useQuery<string[]>({
    queryKey: ["unreachable"],
    queryFn: () => analyze("unreachable"),
  });
  console.log("unreachable", unreachableData);


  const { data: cycleData } = useQuery<string[]>({
    queryKey: ["cycle"],
    queryFn: () => analyze("cycle"),
  });
  console.log("cycle", cycleData);

  const levels: Task[][] = parallelData?.ok ? parallelData.levels : [];
  const depth = levels.length;
  const maxParallel = levels.reduce(
    (max: number, lvl: Task[]) => Math.max(max, lvl.length),
    0,
  );

  const criticalPath: Task[] = levels
    .map((lvl: Task[]) => lvl[0])
    .filter(Boolean);

  const rootTasks = tasks
    .filter((t) => t.dependency.length === 0)
    .map((t) => t.task);

  const depCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    t.dependency.forEach((depId) => {
      const depTask = tasks.find((x) => x.id === depId);
      if (depTask) {
        depCounts[depTask.task] = (depCounts[depTask.task] ?? 0) + 1;
      }
    });
  });
  const bottlenecks = Object.entries(depCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, blocks]) => ({ name, blocks }));

  const downstream: Record<string, string[]> = {};
  tasks.forEach((t) => {
    t.dependency.forEach((depId) => {
      const depTask = tasks.find((x) => x.id === depId);
      if (depTask) {
        if (!downstream[depTask.task]) downstream[depTask.task] = [];
        downstream[depTask.task]!.push(t.task);
      }
    });
  });

  const getImpacted = (taskName: string): string[] => {
    const visited = new Set<string>();
    const queue = [taskName];
    while (queue.length) {
      const curr = queue.shift()!;
      for (const dep of downstream[curr] ?? []) {
        if (!visited.has(dep)) {
          visited.add(dep);
          queue.push(dep);
        }
      }
    }
    return [...visited];
  };

  const impacted = selectedFailure ? getImpacted(selectedFailure) : [];


  const metrics = {
    totalTasks: tasks.length,
    depth,
    maxParallel,
    criticalLength: criticalPath.length,
  };

  return (
    <div className="relative max-w-5xl mx-auto p-6 md:p-8 space-y-10">
      {/* DOT GRID BACKGROUND */}
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none dot-grid" />

      {/* PAGE HEADER */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Activity className="text-indigo-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Advanced Insights</h1>
          <p className="text-sm text-muted-foreground">
            Architectural intelligence & execution analysis
          </p>
        </div>
      </div>

      {/* CYCLE WARNING */}
      {cycleData && cycleData!.length > 0 && (
        <div className="flex items-center gap-3 p-4 border border-red-400 rounded-lg bg-red-500/10 text-red-400">
          <AlertTriangle size={16} />
          <span className="text-sm font-medium">
            Cycle detected in workflow. Execution is not possible.{" "}
            {cycleData!.length > 0 &&
              `Affected node indices: ${cycleData?.join(", ")}`}
          </span>
        </div>
      )}

      <Card>
        <CardContent className="space-y-8 pt-6">
          {/* GRAPH SUMMARY */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Graph Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Tasks" value={metrics.totalTasks} />
              <MetricCard label="Depth" value={metrics.depth} />
              <MetricCard label="Max Parallel" value={metrics.maxParallel} />
              <MetricCard
                label="Critical Path"
                value={metrics.criticalLength}
              />
            </div>
          </section>

          <Separator />

          {/* CRITICAL PATH */}
          <section>
            <SectionHeader
              icon={TrendingUp}
              title="Critical Path"
              description="Longest blocking execution chain"
            />

            <div className="flex flex-wrap items-center gap-2 p-4 mt-3 border rounded-lg border-dashed bg-muted/30">
              {criticalPath.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  No data available.
                </span>
              ) : (
                criticalPath.map((task, i) => (
                  <div key={task.id + i} className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {task.id}
                    </Badge>
                    {i < criticalPath.length - 1 && (
                      <GitBranch size={14} className="text-muted-foreground" />
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <Separator />

          {/* BOTTLENECKS */}
          <section>
            <SectionHeader
              icon={Network}
              title="Bottlenecks"
              description="Tasks that block the most dependents"
            />

            <div className="space-y-3 mt-3">
              {bottlenecks.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  No bottlenecks found.
                </span>
              ) : (
                bottlenecks.map((b) => (
                  <div
                    key={b.name}
                    className="flex items-center justify-between border rounded-lg p-4 hover:border-red-400 transition"
                  >
                    <span className="font-mono text-sm">{b.name}</span>
                    <Badge variant="destructive">
                      Blocks {b.blocks} task{b.blocks > 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </section>

          <Separator />

          {/* ROOT TASKS */}
          <section>
            <SectionHeader
              icon={PlayCircle}
              title="Root Tasks"
              description="Tasks with no dependencies"
            />

            <div className="flex flex-wrap gap-2 mt-3">
              {rootTasks.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  None found.
                </span>
              ) : (
                rootTasks.map((root) => (
                  <Badge key={root} variant="secondary" className="font-mono">
                    {root}
                  </Badge>
                ))
              )}
            </div>
          </section>

          <Separator />

          {/* TERMINAL TASKS */}
          <section>
            <SectionHeader
              icon={GitBranch}
              title="Terminal Tasks"
              description="Leaf tasks with no dependents"
            />

            <div className="flex flex-wrap gap-2 mt-3">
              {terminalData && terminalData.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  None found.
                </span>
              ) : (
               terminalData && terminalData.map((t:string) => (
                  <Badge key={t} variant="secondary" className="font-mono">
                    {t}
                  </Badge>
                ))
              )}
            </div>
          </section>

          <Separator />

          {/* UNREACHABLE TASKS */}
          {unreachableData && unreachableData.length > 0 && (
            <>
              <section>
                <SectionHeader
                  icon={AlertTriangle}
                  title="Unreachable Tasks"
                  description="Tasks that cannot be reached from any root"
                />

                <div className="flex flex-wrap gap-2 mt-3">
                  {unreachableData &&  unreachableData.map((t:string) => (
                    <Badge key={t} variant="destructive" className="font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              </section>

              <Separator />
            </>
          )}

          {/* FAILURE SIMULATION */}
          <section>
            <SectionHeader
              icon={AlertTriangle}
              title="Failure Simulation"
              description="See what breaks if a task fails"
            />

            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <Select
                value={selectedFailure}
                onValueChange={setSelectedFailure}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select task to fail..." />
                </SelectTrigger>

                <SelectContent>
                  {tasks.map((t) => (
                    <SelectItem key={t.id} value={t.task}>
                      {t.task}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                disabled={!selectedFailure}
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {}} // impacted is derived reactively
              >
                <Zap size={14} />
                Simulate
              </Button>
            </div>

            {selectedFailure && (
              <div className="mt-4 space-y-2">
                {impacted.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No downstream impact.
                  </div>
                ) : (
                  impacted.map((task) => (
                    <div
                      key={task}
                      className="border rounded-md p-2 text-sm font-mono"
                    >
                      {task}
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}



function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-6 border rounded-xl text-center hover:border-primary/40 transition">
      <div className="text-3xl font-mono font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-md bg-muted">
        <Icon size={16} />
      </div>

      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
