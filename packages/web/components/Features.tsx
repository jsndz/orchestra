"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Workflow, 
  GitBranch, 
  Cpu, 
  Eye, 
  Terminal, 
  Bot, 
  Layers
} from "lucide-react"

export function Features() {
  const featuresList = [
    {
      icon: <Workflow className="w-5 h-5 text-[#10b981]" />,
      title: "Visual Workflow Engine",
      description: "Automatically computes topological levels and cycle detection. Executes independent tasks concurrently in parallel levels with real-time graph node state updates.",
      badge: "GRAPH VISUALIZER",
      variant: "emerald" as const
    },
    {
      icon: <GitBranch className="w-5 h-5 text-[#06b6d4]" />,
      title: "Pure YAML Native Config",
      description: "Define your pipelines in clean, human-readable YAML files. Zero proprietary DSLs, zero vendor lock-in. Commit your workflows directly to Git.",
      badge: "YAML 1.2",
      variant: "cyan" as const
    },
    {
      icon: <Cpu className="w-5 h-5 text-[#14b8a6]" />,
      title: "100% Local-First Architecture",
      description: "Runs entirely on your machine. Zero cloud dependency, zero internet required, zero external latencies. Direct access to local node and shell binaries.",
      badge: "OFFLINE CAPABLE",
      variant: "teal" as const
    },
    {
      icon: <Eye className="w-5 h-5 text-[#8b5cf6]" />,
      title: "Embedded FileWatcher Engine",
      description: "Monitors target workspace directories for file changes. Automatically triggers relevant task dependency subgraphs while honoring folder ignore rules.",
      badge: "LIVE WATCH",
      variant: "violet" as const
    },
    {
      icon: <Terminal className="w-5 h-5 text-[#f59e0b]" />,
      title: "Pseudo-Terminal (PTY) Streaming",
      description: "Integrated node-pty terminal service with streaming ANSI color rendering, interactive stdin/stdout transport, and isolated subprocess execution.",
      badge: "NODE-PTY",
      variant: "default" as const
    },
    {
      icon: <Bot className="w-5 h-5 text-[#e1f4f3]" />,
      title: "Model Context Protocol (MCP)",
      description: "Exposes 25+ workflow control tools via MCP stdio/HTTP transport. Connect Claude, Cursor, or Google Antigravity to inspect and run local workflows directly.",
      badge: "AI INTEGRATION",
      variant: "default" as const
    },
  ]

  return (
    <section id="features" className="py-16 relative z-10 border-b border-white/12 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="cyan">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-[#06b6d4]" />
            BUILT FOR DEVELOPERS
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-sans">
            POWERFUL FEATURES FOR MODERN DEV STACKS
          </h2>
          <p className="text-white/70 font-sans text-sm sm:text-base leading-relaxed body-md">
            Everything you need to orchestrate build scripts, microservice dependencies, 
            local database migrations, and AI-assisted workflows in one local app.
          </p>
        </div>

        {/* Feature Cards Grid (Clean #0d0d0d canvas, animated hover) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((item, idx) => (
            <Card
              key={idx}
              className="p-6 bg-[#0d0d0d] border border-white/15 rounded-none flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#10b981]/60 hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-[#0d0d0d] border border-white/20 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <Badge variant={item.variant}>
                    {item.badge}
                  </Badge>
                </div>

                <h3 className="text-base font-sans font-bold text-white uppercase tracking-wider">
                  {item.title}
                </h3>

                <p className="text-sm text-white/70 font-sans leading-relaxed body-md">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}
