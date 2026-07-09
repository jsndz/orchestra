import { useEffect, useRef, useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLogStore } from "@/store/useLogStore";
import { useTasks } from "@/hooks/useTasks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Terminal, 
  Filter, 
  Trash2, 
  Search, 
  Eye, 
  EyeOff, 
  Grid,
  CheckSquare,
  Square
} from "lucide-react";

// Theme palette for service prefixes
const SERVICE_PALETTES = [
  { text: "#38bdf8", border: "rgba(56, 189, 248, 0.2)", bg: "rgba(56, 189, 248, 0.05)" }, // Cyan
  { text: "#34d399", border: "rgba(52, 211, 153, 0.2)", bg: "rgba(52, 211, 153, 0.05)" }, // Emerald
  { text: "#a78bfa", border: "rgba(167, 139, 250, 0.2)", bg: "rgba(167, 139, 250, 0.05)" }, // Purple
  { text: "#fbbf24", border: "rgba(251, 191, 36, 0.2)", bg: "rgba(251, 191, 36, 0.05)" },  // Amber
  { text: "#f472b6", border: "rgba(244, 114, 182, 0.2)", bg: "rgba(244, 114, 182, 0.05)" }, // Pink
  { text: "#fb7185", border: "rgba(251, 113, 133, 0.2)", bg: "rgba(251, 113, 133, 0.05)" }, // Rose
  { text: "#2dd4bf", border: "rgba(45, 212, 191, 0.2)", bg: "rgba(45, 212, 191, 0.05)" },  // Teal
  { text: "#60a5fa", border: "rgba(96, 165, 250, 0.2)", bg: "rgba(96, 165, 250, 0.05)" },  // Blue
  { text: "#fb923c", border: "rgba(251, 146, 60, 0.2)", bg: "rgba(251, 146, 60, 0.05)" },  // Orange
];

const getServiceStyle = (serviceName: string) => {
  let hash = 0;
  for (let i = 0; i < serviceName.length; i++) {
    hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SERVICE_PALETTES.length;
  return SERVICE_PALETTES[index];
};

export default function UnifiedLogView() {
  const { data } = useTasks();
  const tasks = data?.tasks ?? [];

  const logs = useLogStore((state) => state.logs);
  const clearLogs = useLogStore((state) => state.clearLogs);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Filter States
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [customRegex, setCustomRegex] = useState("");
  const [regexError, setRegexError] = useState(false);
  const [showHighlightedOnly, setShowHighlightedOnly] = useState(false);
  const [textSearch, setTextSearch] = useState("");

  // Map task IDs to names
  const taskMap = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => map.set(t.id, t.task));
    return map;
  }, [tasks]);

  // Set default visible tasks once they load
  useEffect(() => {
    if (tasks.length > 0 && selectedTaskIds.size === 0) {
      setSelectedTaskIds(new Set(tasks.map((t) => t.id)));
    }
  }, [tasks, selectedTaskIds.size]);

  // Handle Autoscroll on log updates
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 15;
    shouldAutoScroll.current = isAtBottom;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (shouldAutoScroll.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  // Compile Regex safely
  const activeRegex = useMemo(() => {
    if (!customRegex) {
      setRegexError(false);
      return null;
    }
    try {
      const reg = new RegExp(customRegex, "i");
      setRegexError(false);
      return reg;
    } catch {
      setRegexError(true);
      return null;
    }
  }, [customRegex]);

  // Filter logs locally
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Filter by selected service
      if (selectedTaskIds.size > 0 && !selectedTaskIds.has(log.taskId)) {
        return false;
      }

      // 2. Filter by Highlights (Backend Regex Rules)
      if (showHighlightedOnly && !log.color && !log.ruleId) {
        return false;
      }

      // 3. Filter by Custom Regex
      if (activeRegex && !activeRegex.test(log.message)) {
        return false;
      }

      // 4. Filter by Text Substring Search
      if (textSearch && !log.message.toLowerCase().includes(textSearch.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [logs, selectedTaskIds, showHighlightedOnly, activeRegex, textSearch]);

  const toggleTask = (id: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllTasks = () => {
    setSelectedTaskIds(new Set(tasks.map((t) => t.id)));
  };

  const selectNoTasks = () => {
    setSelectedTaskIds(new Set());
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* SIDEBAR - CONTROL BAR */}
      <div className="w-72 border-r border-border/20 bg-card/25 flex flex-col shrink-0">
        <div className="p-4 border-b border-border/10">
          <span className="font-mono text-[10px] tracking-widest text-accent font-bold uppercase block mb-1">
            CONTROL_PANEL
          </span>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">
            Filter multi-service streams
          </span>
        </div>

        {/* REGEX & SEARCH INPUTS */}
        <div className="p-4 border-b border-border/10 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
              Message Substring
            </label>
            <div className="flex items-center gap-2 bg-black border border-border/30 px-3 py-1.5 focus-within:border-accent transition-colors">
              <Search size={12} className="text-muted-foreground/60" />
              <input
                className="bg-transparent outline-none text-xs font-mono flex-1 placeholder:text-muted-foreground/30 text-accent"
                placeholder="SEARCH_LOGS..."
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase flex justify-between">
              <span>Custom Regex</span>
              {regexError && <span className="text-red-500 lowercase">Invalid regex</span>}
            </label>
            <div className={`flex items-center gap-2 bg-black border px-3 py-1.5 focus-within:border-accent transition-colors ${regexError ? 'border-red-500/40' : 'border-border/30'}`}>
              <span className="text-[10px] font-mono text-muted-foreground/50">/</span>
              <input
                className="bg-transparent outline-none text-xs font-mono flex-1 placeholder:text-muted-foreground/30 text-accent"
                placeholder="[LOG] or error|warn..."
                value={customRegex}
                onChange={(e) => setCustomRegex(e.target.value)}
              />
              <span className="text-[10px] font-mono text-muted-foreground/50">/i</span>
            </div>
          </div>

          <button
            onClick={() => setShowHighlightedOnly(!showHighlightedOnly)}
            className={`w-full py-1.5 border font-mono text-[10px] tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer
              ${showHighlightedOnly 
                ? "bg-accent/10 border-accent text-accent" 
                : "border-border/30 hover:border-accent/40 text-muted-foreground hover:text-foreground"
              }`}
          >
            {showHighlightedOnly ? <Eye size={12} /> : <EyeOff size={12} />}
            {showHighlightedOnly ? "Showing rules only" : "Filter to rule matches"}
          </button>
        </div>

        {/* SERVICE TOGGLES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
              Services ({selectedTaskIds.size}/{tasks.length})
            </label>
            <div className="flex gap-2">
              <button 
                onClick={selectAllTasks} 
                className="text-[9px] font-mono text-accent hover:underline cursor-pointer"
              >
                ALL
              </button>
              <span className="text-muted-foreground/30">|</span>
              <button 
                onClick={selectNoTasks} 
                className="text-[9px] font-mono text-accent hover:underline cursor-pointer"
              >
                NONE
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            {tasks.map((task) => {
              const isChecked = selectedTaskIds.has(task.id);
              const style = getServiceStyle(task.task);
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 border transition-all cursor-pointer select-none
                    ${isChecked 
                      ? "bg-[#0f0f0f] border-border/40 text-foreground" 
                      : "bg-transparent border-transparent text-muted-foreground hover:bg-card/30"
                    }`}
                >
                  {isChecked ? (
                    <CheckSquare size={13} className="text-accent" />
                  ) : (
                    <Square size={13} className="text-muted-foreground/40" />
                  )}
                  <span 
                    className="font-mono text-xs truncate flex-1 uppercase tracking-tight"
                    style={{ color: isChecked ? style.text : undefined }}
                  >
                    {task.task}
                  </span>
                  <span className="text-[8px] font-mono px-1 border border-border/20 uppercase text-muted-foreground/60 shrink-0">
                    {task.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* UTILITIES / DANGER ZONE */}
        <div className="p-4 border-t border-border/10 bg-black/10">
          <Button
            onClick={clearLogs}
            variant="ghost"
            className="w-full justify-center h-8 rounded-none border border-red-500/20 hover:border-red-500 text-red-400 hover:bg-red-500/10 text-[10px] font-mono uppercase tracking-wider gap-2 cursor-pointer"
          >
            <Trash2 size={12} />
            Clear Consolidated Log
          </Button>
        </div>
      </div>

      {/* LOG STREAM DISPLAY */}
      <div className="flex-1 flex flex-col bg-black overflow-hidden relative">
        {/* STREAM HEADER */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-card/50 border-b border-border/10 h-11">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-accent animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-accent font-bold uppercase">
              MULTIPLEXED_STREAMS
            </span>
          </div>
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest flex items-center gap-4">
            <span>Filtered: {filteredLogs.length} / {logs.length} Lines</span>
          </div>
        </div>

        {/* LOG SCROLL CONTAINER */}
        <ScrollArea className="flex-1 w-full rounded-none">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="h-full w-full overflow-auto bg-[#080808] font-mono p-5 space-y-1.5 custom-scrollbar"
          >
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 select-none">
                <span className="text-muted-foreground/15 italic text-xs tracking-widest uppercase">
                  {logs.length === 0 ? "Waiting for sequence streams..." : "No logs match current filters"}
                </span>
                {logs.length > 0 && (
                  <span className="text-muted-foreground/35 text-[10px] tracking-wider max-w-sm uppercase">
                    Try adjusting service selection checkboxes, resetting the regex filter, or clearing text search.
                  </span>
                )}
              </div>
            ) : (
              filteredLogs.map((log, i) => {
                const name = taskMap.get(log.taskId) || "unknown";
                const style = getServiceStyle(name);
                const timeString = new Date(log.ts).toLocaleTimeString(undefined, {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }) + `.${String(log.ts % 1000).padStart(3, "0")}`;

                return (
                  <div
                    key={i}
                    className="flex items-start text-[12.5px] leading-relaxed select-text hover:bg-white/[0.02] py-0.5 border-l-2 border-transparent transition-colors px-1"
                  >
                    {/* Timestamp */}
                    <span className="text-[10px] text-muted-foreground/30 mr-3 select-none mt-0.5 shrink-0">
                      {timeString}
                    </span>

                    {/* Service Badge Prefix */}
                    <span
                      className="text-[9px] font-bold px-1.5 py-0 border uppercase tracking-wider mr-3 shrink-0 flex items-center h-4.5 mt-0.5"
                      style={{
                        borderColor: style.border,
                        color: style.text,
                        backgroundColor: style.bg
                      }}
                    >
                      {name}
                    </span>

                    {/* Log Highlight Rule Label */}
                    {log.label && (
                      <span 
                        className="text-[9px] font-bold px-1 py-0.5 border uppercase tracking-tight mr-2 shrink-0 select-none"
                        style={{
                          borderColor: log.color || "#fff",
                          color: log.color || "#fff",
                          backgroundColor: `${log.color}10` || "transparent"
                        }}
                      >
                        {log.label}
                      </span>
                    )}

                    {/* Log Message */}
                    <span
                      className="whitespace-pre-wrap break-all flex-1"
                      style={{ color: log.color || "#e4e4e7" }} // Default to zinc-200
                    >
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
