import { useState } from "react";
import { ArrowRight, Link2, Plus, Loader2 } from "lucide-react";
import { useAddDependency } from "../hooks/useTasks";
import { Task, Dependency } from "../types";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function DependencyForm({
  tasks,
  dependencies,
  onBack,
}: {
  tasks: Task[];
  dependencies: Dependency[];
  onBack: () => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const addDep = useAddDependency();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || from === to) return;
    addDep.mutate({ from, to });
    setFrom("");
    setTo("");
  };

  const name = (id: string) => tasks.find((t) => t.id === id)?.task ?? id;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Link</CardTitle>
            <CardDescription>Define step order (from → to)</CardDescription>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Add dependency */}
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="flex-1 min-w-[140px]">
              <SelectValue placeholder="From step" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.task}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ArrowRight className="h-4 w-4 text-muted-foreground" />

          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="flex-1 min-w-[140px]">
              <SelectValue placeholder="To step" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.task}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="submit"
            disabled={!from || !to || from === to || addDep.isPending}
          >
            {addDep.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </form>

        <Separator />

        {/* List */}
        {/* <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            Current Links ({dependencies.length})
          </div>

          {dependencies.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-sm text-muted-foreground">
              <Link2 className="h-6 w-6 mb-2 opacity-50" />
              No links defined
            </div>
          ) : (
            <div className="space-y-2">
              {dependencies.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm"
                >
                  <span className="font-medium">{name(d.from)}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{name(d.to)}</span>
                </div>
              ))}
            </div>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
}
