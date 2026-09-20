"use client"

import { useState } from "react"
import { 
  Bot, 
  Check, 
  Copy, 
  Terminal, 
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
    <section id="mcp" className="py-16 relative z-10 border-b border-white/12 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="violet">
            <Bot className="w-3.5 h-3.5 mr-1.5 text-[#8b5cf6]" />
            MODEL CONTEXT PROTOCOL (MCP)
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-sans">
            CONNECT YOUR AI ASSISTANT
          </h2>
          <p className="text-white/70 font-sans text-sm sm:text-base leading-relaxed body-md">
            Control local workflows directly from Google Antigravity, Cursor, Windsurf, 
            and Claude Desktop using native Model Context Protocol tools.
          </p>
        </div>

        {/* Card Container (#0d0d0d canvas fill, clean borders) */}
        <Card className="max-w-4xl mx-auto bg-[#0d0d0d] border border-white/15 p-6 sm:p-8 rounded-none space-y-8">
          
          {/* Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0d0d0d] border border-[#10b981]/50 space-y-2 font-mono text-xs rounded-none transition-all duration-200 hover:border-[#10b981]">
              <div className="flex items-center gap-2 text-[#10b981] font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>SYSTEM PATH CLI (`orchestra-mcp`)</span>
              </div>
              <p className="text-white/70 font-sans text-xs leading-relaxed">
                Spawns a headless Node process on demand. <strong>Works even when Orchestra desktop app is closed!</strong>
              </p>
            </div>

            <div className="p-4 bg-[#0d0d0d] border border-[#06b6d4]/50 space-y-2 font-mono text-xs rounded-none transition-all duration-200 hover:border-[#06b6d4]">
              <div className="flex items-center gap-2 text-[#06b6d4] font-bold uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>EMBEDDED HTTP SERVER</span>
              </div>
              <p className="text-white/70 font-sans text-xs leading-relaxed">
                Connects over local HTTP/SSE (`http://localhost:3030/mcp`). Active when Orchestra app is running.
              </p>
            </div>
          </div>

          {/* Connection Mode Selector */}
          <div className="space-y-3 font-mono">
            <label className="text-xs uppercase tracking-wider text-white/70 font-bold">
              1. SELECT CONNECTION TRANSPORT
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransportMode("path")}
                className={`p-4 border text-left flex flex-col gap-1.5 transition-all duration-200 rounded-none cursor-pointer ${
                  transportMode === "path"
                    ? "bg-[#0d0d0d] border-[#e1f4f3] text-[#e1f4f3] shadow-[0_0_15px_rgba(225,244,243,0.15)]"
                    : "bg-[#0d0d0d] border-white/15 text-white/70 hover:border-white/35"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#10b981]" />
                    SYSTEM PATH CLI (`orchestra-mcp`)
                  </span>
                  <Badge variant="emerald">RECOMMENDED</Badge>
                </div>
                <span className="text-[11px] font-sans text-white/60">
                  command: "orchestra-mcp" (Offline Capable Stdio)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTransportMode("http")}
                className={`p-4 border text-left flex flex-col gap-1.5 transition-all duration-200 rounded-none cursor-pointer ${
                  transportMode === "http"
                    ? "bg-[#0d0d0d] border-[#e1f4f3] text-[#e1f4f3] shadow-[0_0_15px_rgba(225,244,243,0.15)]"
                    : "bg-[#0d0d0d] border-white/15 text-white/70 hover:border-white/35"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#06b6d4]" />
                    HTTP SSE ENDPOINT
                  </span>
                </div>
                <span className="text-[11px] font-sans text-white/60">
                  url: "http://localhost:3030/mcp" (HTTP Server)
                </span>
              </button>
            </div>
          </div>

          {/* AI Client Tabs */}
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-wider text-white/70 font-bold font-mono">
              2. SELECT AI CLIENT & COPY CONFIG
            </label>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ClientKey)}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-[#0d0d0d] border border-white/15 rounded-none">
                {(["claude", "cursor", "antigravity", "cli"] as ClientKey[]).map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="py-2.5 text-xs font-sans font-bold uppercase tracking-[0.05em] data-[state=active]:bg-[#0d0d0d] data-[state=active]:text-[#e1f4f3] data-[state=active]:border-[#10b981] rounded-none transition-all duration-200"
                  >
                    {configs[tab].title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {(["claude", "cursor", "antigravity", "cli"] as ClientKey[]).map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4 pt-2 font-mono">
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    {configs[tab].desc}
                  </p>

                  <div className="relative bg-[#0d0d0d] border border-white/15 p-5 text-xs text-[#e1f4f3] rounded-none">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-[10px] text-white/60">
                      <span className="tracking-widest uppercase font-bold text-white">{configs[tab].filename}</span>
                      <span className="text-[#10b981] uppercase tracking-widest font-bold">
                        {transportMode === "http" ? "HTTP / SSE" : "JSON-RPC / STDIO"}
                      </span>
                    </div>

                    <pre className="overflow-x-auto whitespace-pre leading-relaxed font-mono text-sm text-[#e1f4f3]">
                      <code>{currentCode}</code>
                    </pre>

                    <Button
                      onClick={handleCopy}
                      size="sm"
                      className="absolute top-4 right-4 h-8 px-4 bg-[#e1f4f3] text-[#0d0d0d] hover:bg-[#c2d8d7] font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-[#10b981]" />
                          COPIED!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          COPY CONFIG
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Quick Setup Steps */}
          <div className="p-5 bg-[#0d0d0d] border border-white/15 space-y-2 font-sans text-xs rounded-none">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#e1f4f3] uppercase tracking-wider">
              <Info className="w-4 h-4 text-[#10b981]" />
              <span>3-STEP QUICK SETUP</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs text-white/75 leading-relaxed body-md">
              <li>Open Orchestra desktop app → Click <strong>"Connect AI Assistant"</strong> → Click <strong>"Install CLI to PATH"</strong>.</li>
              <li>Paste the generated JSON configuration above into your AI tool setting file.</li>
              <li>Ask your AI assistant: <em>"Use Orchestra to inspect my local workflow status"</em> — instant execution!</li>
            </ol>
          </div>

        </Card>
      </div>
    </section>
  )
}
