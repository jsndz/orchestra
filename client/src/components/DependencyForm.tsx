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
import { Label } from "./ui/label";

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
   <Card className="h-full flex flex-col bg-background border-none rounded-none shadow-none">
  {/* HEADER - Tech Header with Accent Icon */}
  <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 bg-card/30 border-b border-border/20">
   

  
  </CardHeader>

  <CardContent className="flex-1 space-y-6 p-6">
    {/* ADD DEPENDENCY - Industrial Input Strip */}
    <div className="space-y-2">
      <Label className="text-[9px] font-mono uppercase text-muted-foreground tracking-widest">01_Create_New_Link</Label>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 p-3 bg-card/20 border border-border/10">
        <Select value={from} onValueChange={setFrom}>
          <SelectTrigger className="flex-1 min-w-[130px] bg-background border-border/40 rounded-none h-9 font-mono text-[11px] focus:ring-0">
            <SelectValue placeholder="Source_Step" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border/40 rounded-none">
            {tasks.map((t) => (
              <SelectItem key={t.id} value={t.id} className="font-mono text-xs uppercase">
                {t.task}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-center px-1">
          <ArrowRight className="h-4 w-4 text-accent animate-pulse" />
        </div>

        <Select value={to} onValueChange={setTo}>
          <SelectTrigger className="flex-1 min-w-[130px] bg-background border-border/40 rounded-none h-9 font-mono text-[11px] focus:ring-0">
            <SelectValue placeholder="Target_Step" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border/40 rounded-none">
            {tasks.map((t) => (
              <SelectItem key={t.id} value={t.id} className="font-mono text-xs uppercase">
                {t.task}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="submit"
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-none h-9 px-4 font-mono text-[11px] uppercase font-bold tracking-tighter shrink-0"
          disabled={!from || !to || from === to || addDep.isPending}
        >
          {addDep.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Link"
          )}
        </Button>
      </form>
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-border/10 pb-2">
        <Label className="text-[9px] font-mono uppercase text-muted-foreground tracking-widest">
          02_Active_Pipeline_Links
        </Label>
        <span className="text-[10px] font-mono text-accent">[{dependencies.length}]</span>
      </div>

      {dependencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/20 opacity-40">
          <Link2 className="h-5 w-5 mb-2" />
          <span className="text-[10px] font-mono uppercase tracking-widest">No_Connections_Found</span>
        </div>
      ) : (
        <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {dependencies.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between group bg-card/40 border border-border/10 px-4 py-2 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono font-bold uppercase text-foreground">{name(d.from)}</span>
                <ArrowRight size={12} className="text-muted-foreground/40 group-hover:text-accent transition-colors" />
                <span className="text-[11px] font-mono font-bold uppercase text-foreground">{name(d.to)}</span>
              </div>
              <div className="w-1 h-1 bg-accent/50 rounded-full group-hover:shadow-[0_0_8px_#e1f4f3]" />
            </div>
          ))}
        </div>
      )}
    </div>
  </CardContent>
</Card>
  );
}
