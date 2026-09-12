import { useState } from "react";
import { ArrowRight, Link2, Loader2 } from "lucide-react";
import { useAddDependency } from "@/hooks/useTasks";
import { Task, Dependency } from "@/types";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function DependencyForm({
  tasks,
  dependencies,
}: {
  tasks: Task[];
  dependencies: Dependency[];
  onBack?: () => void;
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
   <Card className="h-full flex flex-col bg-[#121215]/80 border border-white/10 rounded-2xl shadow-xl overflow-hidden font-sans">
  <CardContent className="flex-1 space-y-6 p-6">
    {/* ADD DEPENDENCY - Input Strip */}
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">01. Create New Link</Label>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 p-3 bg-[#141418] border border-white/10 rounded-xl">
        <Select value={from} onValueChange={setFrom}>
          <SelectTrigger className="flex-1 min-w-[130px] bg-[#0c0c0e] border border-white/10 rounded-lg h-9 font-sans text-xs text-foreground focus:ring-accent">
            <SelectValue placeholder="Source Step" />
          </SelectTrigger>
          <SelectContent className="bg-[#141418] border border-white/10 rounded-xl">
            {tasks.map((t) => (
              <SelectItem key={t.id} value={t.id} className="font-sans text-xs">
                {t.task}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-center px-1">
          <ArrowRight className="h-4 w-4 text-accent animate-pulse" />
        </div>

        <Select value={to} onValueChange={setTo}>
          <SelectTrigger className="flex-1 min-w-[130px] bg-[#0c0c0e] border border-white/10 rounded-lg h-9 font-sans text-xs text-foreground focus:ring-accent">
            <SelectValue placeholder="Target Step" />
          </SelectTrigger>
          <SelectContent className="bg-[#141418] border border-white/10 rounded-xl">
            {tasks.map((t) => (
              <SelectItem key={t.id} value={t.id} className="font-sans text-xs">
                {t.task}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="submit"
          className="bg-accent text-background hover:bg-accent/90 rounded-lg h-9 px-4 font-sans text-xs font-bold shrink-0 cursor-pointer transition-all"
          disabled={!from || !to || from === to || addDep.isPending}
        >
          {addDep.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Link"
          )}
        </Button>
      </form>
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          02. Active Pipeline Links
        </Label>
        <span className="text-xs font-mono font-bold text-accent">[{dependencies.length}]</span>
      </div>

      {dependencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-xl opacity-60">
          <Link2 className="h-5 w-5 mb-2 text-neutral-400" />
          <span className="text-xs font-sans text-neutral-400">No Connections Found</span>
        </div>
      ) : (
        <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1">
          {dependencies.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between group bg-[#141418] border border-white/10 rounded-xl px-4 py-2.5 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-foreground">{name(d.from)}</span>
                <ArrowRight size={14} className="text-neutral-500 group-hover:text-accent transition-colors" />
                <span className="text-xs font-semibold text-foreground">{name(d.to)}</span>
              </div>
              <div className="w-1.5 h-1.5 bg-accent rounded-full group-hover:shadow-[0_0_8px_rgba(45,212,191,0.8)] transition-all" />
            </div>
          ))}
        </div>
      )}
    </div>
  </CardContent>
</Card>
  );
}
