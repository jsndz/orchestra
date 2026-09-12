"use client"

import { useState } from "react"
import { 
  Bot, 
  Check, 
  Copy, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Globe, 
  Zap,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type ClientKey = "claude" | "cursor" | "antigravity" | "cli"
type TransportMode = "path" | "http"

export function McpSection() {
  const [activeTab, setActiveTab] = useState<ClientKey>("claude")
  const [transportMode, setTransportMode] = useState<TransportMode>("path")
  const [copied, setCopied] = useState(false)

  const getCodeSnippet = (tab: ClientKey, mode: TransportMode) => {
    if (tab === "cli") {
      if (mode === "path") return "orchestra-mcp"
      return "curl -s http://localhost:3030/mcp"
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
      )
    }

    // HTTP
    return JSON.stringify(
      {
        mcpServers: {
          orchestra: {
            url: "http://localhost:3030/mcp"
          }
        }
      },
      null,
      2
    )
  }

  const configs: Record<ClientKey, { title: string; filename: string; desc: string }> = {
    claude: {
      title: "Claude Desktop",
      filename: "claude_desktop_config.json",
      desc: "Add to ~/Library/Application Support/Claude/claude_desktop_config.json or %APPDATA%/Claude/claude_desktop_config.json"
    },
    cursor: {
      title: "Cursor / Windsurf",
      filename: ".mcp.json",
      desc: "Place in project workspace root .mcp.json or global Cursor MCP settings"
    },
    antigravity: {
      title: "Google Antigravity",
      filename: ".mcp.json",
      desc: "Add to project root .mcp.json or global ~/.gemini/mcp_config.json"
    },
    cli: {
      title: "Stdio CLI Command",
      filename: "Terminal Execution",
      desc: "Execute directly from standard input/output transport or test endpoint"
    }
  }

  const currentCode = getCodeSnippet(activeTab, transportMode)

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 border-t border-border/10">
      <div className="flex flex-col items-center gap-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-xl">
          <Badge variant="default" className="mb-2">
            <Bot className="w-3.5 h-3.5 mr-1.5" />
            Model Context Protocol (MCP)
          </Badge>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-foreground">
            CONNECT YOUR AI ASSISTANT
          </h2>
          <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-medium">
            Control local DAG workflows directly from Antigravity, Cursor, and Claude Desktop.
          </p>
        </div>

        {/* Card Container */}
        <Card className="w-full max-w-3xl bg-card/40 border-border/20 backdrop-blur-md p-6 relative overflow-hidden space-y-6">
          
          {/* Architecture & Offline Capability Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <Card className="p-3 bg-accent/5 border-accent/20 space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-accent text-[11px] font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>System CLI (`orchestra-mcp`)</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-sans leading-relaxed">
                Spawns a headless Node process on demand. <strong>Works even when the Orchestra desktop app is completely turned OFF!</strong>
              </p>
            </Card>

            <Card className="p-3 bg-background/50 border-border/20 space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-foreground text-[11px] font-bold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-accent" />
                <span>Embedded HTTP Server</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-sans leading-relaxed">
                Connects over local HTTP/SSE (`http://localhost:3030/mcp`). Requires Orchestra app open with HTTP server started.
              </p>
            </Card>
          </div>

          {/* Transport Connection Method Selector */}
          <div className="space-y-2 font-mono">
            <label className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
              Select Connection Method
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransportMode("path")}
                className={`p-3 border text-left flex flex-col gap-1 transition-all ${
                  transportMode === "path"
                    ? "bg-accent/10 border-accent text-accent"
                    : "bg-background/60 border-border/20 text-muted-foreground hover:border-border/50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    System PATH CLI (`orchestra-mcp`)
                  </span>
                  <Badge variant="outline" className="text-[7px] py-0 h-3 border-accent/40 text-accent">RECOMMENDED</Badge>
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
                    : "bg-background/60 border-border/20 text-muted-foreground hover:border-border/50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    HTTP Server Endpoint
                  </span>
                </div>
                <span className="text-[8px] font-sans text-muted-foreground">
                  url: "http://localhost:3030/mcp" (Requires App Open)
                </span>
              </button>
            </div>
          </div>

          {/* AI Client Tabs */}
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold font-mono">
              Select Your AI Client Config
            </label>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ClientKey)}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-1 mb-4 bg-background/60 p-1 border-border/10">
                {(["claude", "cursor", "antigravity", "cli"] as ClientKey[]).map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="py-2 text-[10px]">
                    {configs[tab].title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {(["claude", "cursor", "antigravity", "cli"] as ClientKey[]).map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4 font-mono">
                  <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-sans">
                    {configs[tab].desc}
                  </p>

                  <div className="relative bg-black border border-border/30 p-5 text-xs text-accent/90 group">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-[9px] text-muted-foreground">
                      <span className="tracking-widest uppercase">{configs[tab].filename}</span>
                      <span className="text-[8px] text-accent/60 uppercase tracking-widest font-bold">
                        {transportMode === "http" ? "HTTP / SSE" : "JSON-RPC / stdio"}
                      </span>
                    </div>

                    <pre className="overflow-x-auto whitespace-pre leading-relaxed">
                      <code>{currentCode}</code>
                    </pre>

                    <Button
                      onClick={handleCopy}
                      size="sm"
                      className="absolute top-4 right-4 h-8 bg-white/10 hover:bg-accent hover:text-background text-foreground border border-white/20 rounded-none text-[9px] uppercase tracking-wider font-bold transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          COPIED
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          COPY
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Quick Setup Instructions */}
          <Card className="p-4 bg-background/40 border-border/20 space-y-2.5 font-sans text-xs">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-accent uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>3-Step Quick Setup</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[10px] text-muted-foreground leading-relaxed">
              <li>Open Orchestra app → Click <strong>"Connect AI Assistant"</strong> → Click <strong>"Install CLI to PATH"</strong>.</li>
              <li>Paste the generated JSON snippet above into your AI tool configuration file.</li>
              <li>Ask your AI: <em>"Use Orchestra to inspect my workflow state"</em> — it will execute commands locally instantly!</li>
            </ol>
          </Card>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/10 font-mono text-[9px]">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Terminal className="w-4 h-4 text-accent" />
              <span>Headless CLI & Stdio transport</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>100% Local (Zero cloud transmission)</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="w-4 h-4 text-accent" />
              <span>25+ Local Workflow Control Tools</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
