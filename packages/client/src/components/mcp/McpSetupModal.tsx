import { useState, useEffect } from "react";
import { 
  Bot, 
  Check, 
  Copy, 
  Terminal, 
  Cpu, 
  X, 
  ShieldCheck,
  Download,
  Trash2,
  Globe,
  Play,
  Square,
  AlertCircle,
  Info,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type McpSetupModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ClientKey = "claude" | "cursor" | "antigravity" | "cli";
type TransportMode = "path" | "http";

export default function McpSetupModal({ isOpen, onClose }: McpSetupModalProps) {
  const [activeTab, setActiveTab] = useState<ClientKey>("claude");
  const [transportMode, setTransportMode] = useState<TransportMode>("path");
  const [copied, setCopied] = useState(false);
  
  // HTTP Server state
  const [serverRunning, setServerRunning] = useState(false);
  const [serverPort, setServerPort] = useState(3030);

  // CLI state
  const [cliInstalled, setCliInstalled] = useState(false);
  const [cliPath, setCliPath] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const checkStatus = async () => {
    if (window.api?.mcpServerStatus) {
      try {
        const sRes = await window.api.mcpServerStatus();
        setServerRunning(sRes.running);
        setServerPort(sRes.port || 3030);
      } catch (err) {
        console.error("Failed to check MCP Server status:", err);
      }
    }

    if (window.api?.mcpCliStatus) {
      try {
        const cRes = await window.api.mcpCliStatus();
        setCliInstalled(cRes.installed);
        setCliPath(cRes.path);
        if (cRes.installed) {
          setTransportMode("path");
        }
      } catch (err) {
        console.error("Failed to check MCP CLI status:", err);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartServer = async () => {
    if (!window.api?.mcpServerStart) return;
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await window.api.mcpServerStart(serverPort);
      if (res.success) {
        setServerRunning(true);
        setServerPort(res.port);
        setActionMessage(`HTTP MCP Server running on port ${res.port}`);
      } else {
        setActionMessage(`Error starting server: ${res.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMessage(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStopServer = async () => {
    if (!window.api?.mcpServerStop) return;
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await window.api.mcpServerStop();
      if (res.success) {
        setServerRunning(false);
        setActionMessage("HTTP MCP Server stopped");
      } else {
        setActionMessage(`Error stopping server: ${res.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMessage(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallCli = async () => {
    if (!window.api?.mcpCliInstall) return;
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await window.api.mcpCliInstall();
      if (res.success) {
        setCliInstalled(true);
        setCliPath(res.path);
        setTransportMode("path");
        setActionMessage(`Installed CLI executable to ${res.path}`);
      } else {
        setActionMessage(`Error: ${res.error || "Installation failed"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMessage(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUninstallCli = async () => {
    if (!window.api?.mcpCliUninstall) return;
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await window.api.mcpCliUninstall();
      if (res.success) {
        setCliInstalled(false);
        setCliPath(null);
        setTransportMode("http");
        setActionMessage("Removed orchestra-mcp from PATH");
      } else {
        setActionMessage(`Error: ${res.error || "Uninstall failed"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMessage(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const getCodeSnippet = (tab: ClientKey, mode: TransportMode) => {
    if (tab === "cli") {
      if (mode === "path") return "orchestra-mcp";
      return `curl -s http://localhost:${serverPort}/mcp`;
    }

    if (mode === "path") {
      return JSON.stringify(
        {
          mcpServers: {
            orchestra: {
              command: "orchestra-mcp"
            }
          }
        },
        null,
        2
      );
    }

    // HTTP
    return JSON.stringify(
      {
        mcpServers: {
          orchestra: {
            url: `http://localhost:${serverPort}/mcp`
          }
        }
      },
      null,
      2
    );
  };

  const configs: Record<ClientKey, { title: string; filename: string; desc: string }> = {
    claude: {
      title: "Claude Desktop",
      filename: "claude_desktop_config.json",
      desc: "Add to ~/Library/Application Support/Claude/claude_desktop_config.json or %APPDATA%/Claude/claude_desktop_config.json"
    },
    cursor: {
      title: "Cursor / Windsurf",
      filename: ".mcp.json",
      desc: "Add to workspace root .mcp.json or global Cursor MCP settings"
    },
    antigravity: {
      title: "Google Antigravity",
      filename: ".mcp.json",
      desc: "Add to workspace root .mcp.json or global ~/.gemini/mcp_config.json"
    },
    cli: {
      title: "Direct Command",
      filename: "Terminal Execution",
      desc: "Run directly from standard input/output transport or test endpoint"
    }
  };

  const currentCode = getCodeSnippet(activeTab, transportMode);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-2xl bg-card border-border/30 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-accent/0 via-accent to-accent/0" />

        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/20 bg-background/50 space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 border border-accent/20 text-accent">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-black tracking-[0.2em]">
                  MCP CONFIGURATION
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[9px] border-accent/40 text-accent">
                  OPT-IN
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono tracking-wider mt-0.5">
                Model Context Protocol Server & Stdio CLI Controls
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-none hover:bg-white/10 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        {/* Content Body */}
        <CardContent className="p-6 space-y-5 overflow-y-auto flex-1 font-mono text-xs">
          
          {/* Controls Grid: Method 1 (System CLI) & Method 2 (HTTP Server) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Method 1: System PATH CLI */}
            <Card className="p-3 bg-background border-border/30 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-foreground">
                    <Zap className="w-3.5 h-3.5 text-accent" />
                    <span>System CLI (`orchestra-mcp`)</span>
                  </div>
                  {cliInstalled ? (
                    <Badge variant="default" className="bg-emerald-950/50 text-emerald-400 border-emerald-500/40 text-[8px] py-0">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-1" />
                      INSTALLED
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground border-border/40 text-[8px] py-0">
                      NOT INSTALLED
                    </Badge>
                  )}
                </div>
                <p className="text-[8px] text-muted-foreground font-sans leading-tight">
                  Spawns a headless process on demand. <strong>Works even when desktop app is CLOSED!</strong>
                </p>
              </div>

              <div>
                {cliInstalled ? (
                  <Button
                    onClick={handleUninstallCli}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-[9px] uppercase tracking-wider font-bold text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-950/20"
                  >
                    <Trash2 className="w-3 h-3 mr-1.5" />
                    Uninstall CLI
                  </Button>
                ) : (
                  <Button
                    onClick={handleInstallCli}
                    disabled={loading}
                    variant="default"
                    size="sm"
                    className="w-full h-7 text-[9px] uppercase tracking-wider font-bold bg-accent text-background hover:bg-accent/90"
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    Install CLI to PATH
                  </Button>
                )}
              </div>
            </Card>

            {/* Method 2: Embedded HTTP MCP Server */}
            <Card className="p-3 bg-background border-border/30 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-foreground">
                    <Globe className="w-3.5 h-3.5 text-accent" />
                    <span>Embedded HTTP Server</span>
                  </div>
                  {serverRunning ? (
                    <Badge variant="default" className="bg-emerald-950/50 text-emerald-400 border-emerald-500/40 text-[8px] py-0">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-1" />
                      ONLINE (:3030)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground border-border/40 text-[8px] py-0">
                      OFFLINE
                    </Badge>
                  )}
                </div>
                <p className="text-[8px] text-muted-foreground font-sans leading-tight">
                  Connects over local HTTP/SSE (`http://localhost:3030/mcp`). Requires app open with server started.
                </p>
              </div>

              <div>
                {serverRunning ? (
                  <Button
                    onClick={handleStopServer}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-[9px] uppercase tracking-wider font-bold text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-950/20"
                  >
                    <Square className="w-3 h-3 mr-1.5 fill-current" />
                    Stop MCP Server
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartServer}
                    disabled={loading}
                    variant="default"
                    size="sm"
                    className="w-full h-7 text-[9px] uppercase tracking-wider font-bold bg-emerald-500 text-black hover:bg-emerald-400"
                  >
                    <Play className="w-3 h-3 mr-1.5 fill-current" />
                    Start MCP Server
                  </Button>
                )}
              </div>
            </Card>

          </div>

          {actionMessage && (
            <div className="text-[9px] font-sans text-accent/90 bg-accent/10 border border-accent/20 p-2">
              {actionMessage}
            </div>
          )}

          {/* Transport Mode Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                Select Connection Method
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransportMode("path")}
                className={`p-3 border text-left flex flex-col gap-1 transition-all ${
                  transportMode === "path"
                    ? "bg-accent/10 border-accent text-accent"
                    : "bg-background border-border/20 text-muted-foreground hover:border-border/50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    System PATH CLI (`orchestra-mcp`)
                  </span>
                  {cliInstalled ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Badge variant="outline" className="text-[7px] py-0 h-3 border-accent/40 text-accent">RECOMMENDED</Badge>
                  )}
                </div>
                <span className="text-[8px] font-sans text-muted-foreground">
                  command: "orchestra-mcp" (Offline Capable)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTransportMode("http")}
                className={`p-3 border text-left flex flex-col gap-1 transition-all ${
                  transportMode === "http"
                    ? "bg-accent/10 border-accent text-accent"
                    : "bg-background border-border/20 text-muted-foreground hover:border-border/50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    HTTP Server Endpoint
                  </span>
                  {serverRunning && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[8px] font-sans text-muted-foreground">
                  url: "http://localhost:3030/mcp" (Requires App Open)
                </span>
              </button>
            </div>
          </div>

          {/* Alert Warning if HTTP mode selected but server is OFFLINE */}
          {transportMode === "http" && !serverRunning && (
            <Card className="p-3 bg-amber-950/20 border-amber-500/30 flex items-center justify-between font-sans">
              <div className="flex items-center gap-2 text-amber-400 text-[10px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>HTTP MCP Server is currently <strong>OFFLINE</strong>. Start server to connect.</span>
              </div>
              <Button
                onClick={handleStartServer}
                disabled={loading}
                size="sm"
                className="h-6 text-[9px] bg-amber-500 text-black hover:bg-amber-400 font-bold uppercase"
              >
                Start Server
              </Button>
            </Card>
          )}

          {/* Alert Warning if PATH mode selected but CLI is NOT INSTALLED */}
          {transportMode === "path" && !cliInstalled && (
            <Card className="p-3 bg-accent/10 border-accent/30 flex items-center justify-between font-sans">
              <div className="flex items-center gap-2 text-accent text-[10px]">
                <Info className="w-4 h-4 shrink-0" />
                <span>Click <strong>"Install CLI to PATH"</strong> to create the <code className="font-mono text-accent">orchestra-mcp</code> executable.</span>
              </div>
              <Button
                onClick={handleInstallCli}
                disabled={loading}
                size="sm"
                className="h-6 text-[9px] bg-accent text-background hover:bg-accent/90 font-bold uppercase"
              >
                Install CLI
              </Button>
            </Card>
          )}

          {/* Client Selection Tabs */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
              Select Your AI Client Configuration
            </label>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ClientKey)}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-1 bg-background p-1 border-border/20">
                {(["claude", "cursor", "antigravity", "cli"] as ClientKey[]).map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="py-2 text-[10px]">
                    {configs[tab].title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {(["claude", "cursor", "antigravity", "cli"] as ClientKey[]).map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-3 space-y-3">
                  <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-sans">
                    {configs[tab].desc}
                  </p>

                  <div className="relative bg-black border border-border/30 p-4 font-mono text-[11px] text-accent/90 rounded-none group">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-[9px] text-muted-foreground">
                      <span className="tracking-widest uppercase">{configs[tab].filename}</span>
                      <span className="text-[8px] text-accent/60 uppercase font-bold">
                        {transportMode === "http" ? "HTTP / SSE" : "JSON-RPC / stdio"}
                      </span>
                    </div>

                    <pre className="overflow-x-auto whitespace-pre leading-relaxed">
                      <code>{currentCode}</code>
                    </pre>

                    <Button
                      onClick={handleCopy}
                      size="sm"
                      className="absolute top-3 right-3 h-7 bg-white/10 hover:bg-accent hover:text-background text-foreground border border-white/20 rounded-none text-[9px] uppercase tracking-wider font-bold transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 mr-1 text-emerald-400" />
                          COPIED
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          COPY
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Quick Setup Instructions Card */}
          <Card className="p-3.5 bg-background/60 border-border/20 space-y-2 font-sans text-xs">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-accent uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>3-Step Setup Guide</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[10px] text-muted-foreground leading-relaxed">
              <li>Click <strong>"Install CLI to PATH"</strong> above (or click <strong>"Start MCP Server"</strong> if using HTTP).</li>
              <li>Paste the generated JSON snippet into your AI client config (`.mcp.json` or `claude_desktop_config.json`).</li>
              <li>Ask your AI assistant: <em>"Inspect my Orchestra workflow state"</em> — it will connect directly!</li>
            </ol>
          </Card>

          {/* Capabilities List */}
          <Card className="p-3 bg-accent/5 border-accent/15 space-y-2">
            <div className="flex items-center gap-2 text-accent">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                25+ Available MCP Tools Included
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground/80 leading-relaxed font-sans">
              AI assistants can execute workflows (<code className="text-accent font-mono">run_workflow</code>), inspect task states (<code className="text-accent font-mono">get_workflow</code>), modify tasks, view real-time logs, and monitor terminal processes locally.
            </p>
          </Card>
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-6 py-3 border-t border-border/20 bg-background/50 flex justify-between items-center text-[9px] font-mono text-muted-foreground">
          <span className="uppercase tracking-widest">Orchestra MCP Configuration</span>
          <Button
            onClick={onClose}
            variant="outline"
            className="h-8 text-[10px] uppercase tracking-widest font-bold border-border/30 hover:bg-white hover:text-black"
          >
            Done
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
