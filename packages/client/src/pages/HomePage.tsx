import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UploadYaml from "@/components/workflow/UploadYaml";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Github, 
  Terminal, 
  Bot, 
  Upload, 
  Play, 
  FileCode, 
  FolderGit2, 
  History, 
  Command, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Sliders
} from "lucide-react";
import McpSetupModal from "@/components/mcp/McpSetupModal";
import { useWorkflowStore, RecentWorkflow } from "@/store/useAppStore";
import { uploadYaml } from "@/api/tasks";

export default function HomePage() {
  const navigate = useNavigate();
  const [isMcpOpen, setIsMcpOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { workflowName, setWorkflowName, recentWorkflows, addRecentWorkflow } = useWorkflowStore();
  const [diskRecents, setDiskRecents] = useState<RecentWorkflow[]>([]);

  // Load persistent recent workflows from Electron disk storage
  useEffect(() => {
    if (window.api?.getRecentWorkflows) {
      window.api.getRecentWorkflows().then((list) => {
        if (list && Array.isArray(list) && list.length > 0) {
          setDiskRecents(list);
        }
      }).catch(console.error);
    }
  }, []);


  const rawRecents = diskRecents.length > 0 ? diskRecents : recentWorkflows;
  const displayRecents = (rawRecents || [])

  const openGithub = () => {
    if (window.api?.openExternal) {
      window.api.openExternal("https://github.com/jsndz/orchestra");
    } else {
      window.open("https://github.com/jsndz/orchestra", "_blank");
    }
  };

  const openDocs = () => {
    if (window.api?.openExternal) {
      window.api.openExternal("https://github.com/jsndz/orchestra#readme");
    } else {
      window.open("https://github.com/jsndz/orchestra#readme", "_blank");
    }
  };

  // Keyboard Shortcuts Handler (⌘N, ⌘O, ⌘M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!isCmdOrCtrl) return;

      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        navigate("/tasks");
      } else if (e.key.toLowerCase() === "o") {
        e.preventDefault();
        fileInputRef.current?.click();
      } else if (e.key.toLowerCase() === "m" && e.shiftKey) {
        e.preventDefault();
        setIsMcpOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // File Process Helper for File Drop & Select
  const handleProcessFile = async (file: File) => {
    try {
      await uploadYaml(file);
      const name = file.name.replace(/\.(yaml|yml)$/i, "");
      setWorkflowName(name);

      const entry = {
        name: file.name,
        path: `./${file.name}`,
        taskCount: 4,
        status: "idle" as const,
        lastRun: "Just now",
      };

      addRecentWorkflow(entry);
      if (window.api?.addRecentWorkflow) {
        const updated = await window.api.addRecentWorkflow(entry);
        if (updated) setDiskRecents(updated);
      }

      navigate("/tasks");
    } catch (err) {
      console.error("Failed to load workflow file:", err);
    }
  };

  // File Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".yaml") || file.name.endsWith(".yml")) {
        await handleProcessFile(file);
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
    e.target.value = "";
  };

  const handleSelectRecent = (wf: RecentWorkflow) => {
    setWorkflowName(wf.name.replace(/\.(yaml|yml)$/i, ""));
    navigate("/tasks");
  };

  const handleRunRecent = (e: React.MouseEvent, wf: RecentWorkflow) => {
    e.stopPropagation();
    setWorkflowName(wf.name.replace(/\.(yaml|yml)$/i, ""));
    navigate("/execution");
  };

  return (
    <main 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen flex flex-col justify-between bg-background text-foreground selection:bg-accent selection:text-background relative overflow-x-hidden font-mono"
    >
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* Invisible File Input for ⌘O and Secondary Open */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* TOP DESKTOP TITLE BAR / TELEMETRY HEADER */}
      <header className="w-full border-b border-border/20 bg-background/60 backdrop-blur-md px-6 py-3 flex items-center justify-between z-20 sticky top-0">
        {/* Left: Operational Telemetry Badge */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-950/40 border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold tracking-wider py-1 px-3 rounded-full flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>DAEMON :: ACTIVE (:3030)</span>
          </Badge>
          <span className="text-[9px] text-muted-foreground/60 tracking-widest hidden sm:inline">
            127.0.0.1
          </span>
        </div>

        {/* Right: Quick Links & Tools */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsMcpOpen(true)}
            variant="outline"
            size="sm"
            className="h-7 text-[9px] font-mono tracking-wider uppercase border-accent/30 text-accent hover:bg-accent hover:text-background transition-all"
          >
            <Bot className="w-3.5 h-3.5 mr-1.5" />
            AI Assistant (MCP)
          </Button>

          <Button
            onClick={openDocs}
            variant="ghost"
            size="sm"
            className="h-7 text-[9px] font-mono tracking-wider uppercase text-muted-foreground hover:text-foreground"
          >
            Docs
          </Button>

          <Button
            onClick={openGithub}
            variant="ghost"
            size="sm"
            className="h-7 text-[9px] font-mono tracking-wider uppercase text-muted-foreground hover:text-foreground"
          >
            <Github className="w-3.5 h-3.5 mr-1" />
            GitHub
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="w-full max-w-5xl mx-auto px-6 py-8 flex flex-col items-center flex-1 justify-center z-10 space-y-10">
        
        {/* HERO SECTION: LOGO & TACTICAL WORDMARK */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group cursor-pointer" onClick={() => navigate("/tasks")}>
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-75 group-hover:scale-110 transition-all duration-500" />
            <img
              src="./icon.png"
              alt="Orchestra Icon"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter grayscale brightness-200 group-hover:scale-105 transition-transform duration-300 relative z-10"
            />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-[0.25em] uppercase text-foreground leading-none">
              ORCHESTRA
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground tracking-[0.35em] uppercase font-bold">
              TACTICAL LOCAL WORKFLOW COMMAND HUB
            </p>
          </div>
        </div>

        {/* PRIMARY ACTION PAIR & DRAG-AND-DROP CONTAINER */}
        <div className="w-full max-w-xl space-y-4">
          <div 
            className={`border-2 border-dashed transition-all rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center gap-5 text-center relative ${
              isDragging 
                ? "border-accent bg-accent/15 scale-[1.02] shadow-[0_0_30px_rgba(225,244,243,0.2)]" 
                : "border-border/30 bg-card/40 hover:border-border/60"
            }`}
          >
            {/* Dragging Overlay State */}
            {isDragging ? (
              <div className="py-4 space-y-2 animate-in fade-in duration-150">
                <Upload className="w-10 h-10 text-accent mx-auto animate-bounce" />
                <p className="text-xs font-bold text-accent tracking-widest uppercase">
                  DROP WORKFLOW YAML TO INSPECT & EXECUTE
                </p>
              </div>
            ) : (
              <>
                {/* 2-Button Primary Action Pair */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <Button
                    onClick={() => navigate("/tasks")}
                    size="lg"
                    className="h-12 bg-accent text-background font-black hover:bg-accent/90 rounded-lg text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(225,244,243,0.15)] cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Create New Workflow</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] bg-background/20 rounded font-mono">⌘N</kbd>
                  </Button>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="lg"
                    className="h-12 border-border/40 bg-background/50 hover:bg-white/10 text-foreground font-bold rounded-lg text-xs tracking-wider uppercase cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4 text-accent" />
                    <span>Open Existing YAML</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] bg-white/10 text-muted-foreground rounded font-mono">⌘O</kbd>
                  </Button>
                </div>

                {/* Drag-and-Drop Hint */}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 font-sans tracking-wide pt-1">
                  <FileCode className="w-3.5 h-3.5 text-accent/80 shrink-0" />
                  <span>
                    Drag & drop a <code className="font-mono text-accent">.orchestra.yaml</code> or <code className="font-mono text-accent">.yaml</code> file anywhere to open
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* OPERATIONAL HUB: RECENT WORKFLOWS / WORKSPACES */}
        <div className="w-full max-w-3xl space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              <History className="w-4 h-4 text-accent" />
              <span>Recent Workflows & Workspaces</span>
            </div>
            <span className="text-[9px] text-muted-foreground tracking-widest uppercase">
              {displayRecents.length} Active Workflows
            </span>
          </div>

          <div className="bg-card/30 border border-border/20 rounded-xl overflow-hidden shadow-xl">
            {displayRecents.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No recent workflows found. Click "Create New Workflow" to get started.
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {displayRecents.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => handleSelectRecent(wf)}
                    className="p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2 bg-background border border-border/30 text-accent rounded-lg group-hover:border-accent/40 transition-colors shrink-0">
                        <FolderGit2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate">
                            {wf.name}
                          </span>
                          <Badge variant="outline" className="text-[8px] py-0 px-1.5 h-4 border-border/30 text-muted-foreground font-mono">
                            {wf.taskCount} Tasks
                          </Badge>
                        </div>
                        <p className="text-[9px] text-muted-foreground/70 truncate font-mono">
                          {wf.path}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block space-y-0.5 font-mono">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            wf.status === "success" ? "bg-emerald-400" : wf.status === "running" ? "bg-blue-400 animate-pulse" : "bg-muted-foreground"
                          }`} />
                          <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                            {wf.status || "Idle"}
                          </span>
                        </div>
                        <p className="text-[8px] text-muted-foreground/50">
                          {wf.lastRun}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={(e) => handleRunRecent(e, wf)}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[9px] uppercase tracking-wider text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 rounded cursor-pointer"
                        >
                          <Play className="w-3 h-3 mr-1 fill-current" />
                          Run
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground group-hover:text-accent rounded cursor-pointer"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KEYBOARD SHORTCUTS HINTS */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-[9px] text-muted-foreground/60 font-mono">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-card border border-border/30 rounded text-foreground">⌘N</kbd>
              <span>New Workflow</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-card border border-border/30 rounded text-foreground">⌘O</kbd>
              <span>Open YAML</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-card border border-border/30 rounded text-foreground">⌘⇧M</kbd>
              <span>MCP Config</span>
            </span>
          </div>
        </div>
      </div>

      <McpSetupModal isOpen={isMcpOpen} onClose={() => setIsMcpOpen(false)} />

      {/* BOTTOM TELEMETRY FOOTER */}
      <footer className="w-full border-t border-border/20 bg-background/80 backdrop-blur-md px-6 py-3 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between font-mono text-[9px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="uppercase tracking-[0.2em] font-bold text-foreground">
                SYSTEM :: OPERATIONAL
              </span>
            </div>
            <span className="hidden md:inline text-muted-foreground/40">|</span>
            <span className="hidden md:inline text-muted-foreground/60">
              DAEMON: 127.0.0.1:3030
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="uppercase tracking-widest text-muted-foreground/60">
              BUILD 1.0.0 (ELECTRON)
            </span>
            <span className="hidden sm:inline uppercase tracking-widest text-muted-foreground/40">
              MIT LICENSE
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
