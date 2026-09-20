"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  RotateCcw, 
  Clock, 
  Terminal, 
  FileCode, 
  Sparkles, 
  RefreshCw,
  GitBranch,
  ChevronRight,
  Database,
  Server,
  Layout,
  Zap,
  Check
} from "lucide-react"

export interface WorkflowNode {
  id: string
  name: string
  cmd: string
  tech: "docker" | "golang" | "react" | "orchestra"
  level: number
  deps: string[]
  status: "idle" | "pending" | "running" | "success"
  duration?: string
  logs: string[]
}

const INITIAL_NODES: WorkflowNode[] = [
  {
    id: "db:up",
    name: "1. db:up",
    cmd: "docker compose up -d postgres redis",
    tech: "docker",
    level: 1,
    deps: [],
    status: "idle",
    logs: [
      "[docker] Creating network 'app-net'...",
      "[docker] Container app-postgres Created",
      "[docker] Container app-redis Created",
      "[docker] Container app-postgres Started (Healthy)",
      "[docker] Container app-redis Started (Healthy)"
    ]
  },
  {
    id: "db:migrate",
    name: "2. db:migrate",
    cmd: "go run ./cmd/migrate",
    tech: "golang",
    level: 2,
    deps: ["db:up"],
    status: "idle",
    logs: [
      "[golang] Connecting to postgresql://postgres:***@localhost:5432/app_db",
      "[golang] Applying migration 0001_initial_schema.sql...",
      "[golang] Applying migration 0002_add_users_table.sql...",
      "[golang] Migration complete. Applied 2 migrations successfully."
    ]
  },
  {
    id: "backend:build",
    name: "3a. backend:build",
    cmd: "go build -o dist/api ./cmd/api",
    tech: "golang",
    level: 3,
    deps: ["db:migrate"],
    status: "idle",
    logs: [
      "[golang] Compiling Go package ./cmd/api...",
      "[golang] Linking target binary dist/api...",
      "[golang] Binary dist/api created successfully (14.2 MB)."
    ]
  },
  {
    id: "frontend:build",
    name: "3b. frontend:build",
    cmd: "npm run build -w @app/client",
    tech: "react",
    level: 3,
    deps: ["db:migrate"],
    status: "idle",
    logs: [
      "[vite] building for production...",
      "[vite] transform (42 modules)...",
      "[vite] dist/assets/index-D7b3x.js   142 kB │ gzip: 44 kB",
      "[vite] dist/index.html               0.45 kB",
      "[vite] built in 420ms"
    ]
  },
  {
    id: "app:start",
    name: "4. app:start",
    cmd: "./dist/api & npm run start",
    tech: "orchestra",
    level: 4,
    deps: ["backend:build", "frontend:build"],
    status: "idle",
    logs: [
      "[orchestra] Spawning parallel supervisor process...",
      "[backend] HTTP server listening on http://0.0.0.0:8080",
      "[frontend] Preview server ready at http://localhost:3000",
      "Full stack application active & ready for connections!"
    ]
  }
]

const SAMPLE_YAML = `name: fullstack-dev-pipeline
version: "1.0"

tasks:
  # Level 1: Launch Local Database Infrastructure
  - id: db:up
    command: docker compose up -d postgres redis
    folder: ./infra

  # Level 2: Execute Database Schema Migrations
  - id: db:migrate
    command: go run ./cmd/migrate
    folder: ./backend
    dependsOn:
      - db:up

  # Level 3a: Compile Golang REST API Binary
  - id: backend:build
    command: go build -o dist/api ./cmd/api
    folder: ./backend
    dependsOn:
      - db:migrate

  # Level 3b: Build React Frontend Assets (Parallel Execution)
  - id: frontend:build
    command: npm run build -w @app/client
    folder: ./frontend
    dependsOn:
      - db:migrate

  # Level 4: Launch Backend API & Frontend Dev Server
  - id: app:start
    command: ./dist/api & npm run start
    folder: ./
    dependsOn:
      - backend:build
      - frontend:build`

export function InteractiveDemo() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"graph" | "yaml">("graph")
  const [selectedNodeId, setSelectedNodeId] = useState<string>("db:up")
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Orchestra workflow engine ready.",
    "Click 'Next Step' or 'Auto Play' to test step-by-step pipeline execution!"
  ])

  // Reset simulation
  const resetDemo = () => {
    setNodes(INITIAL_NODES)
    setCurrentStep(0)
    setIsPlaying(false)
    setSelectedNodeId("db:up")
    setTerminalLogs([
      "Pipeline reset.",
      "Click 'Next Step' or 'Auto Play' to test step-by-step pipeline execution!"
    ])
  }

  // Helper to execute a step
  const executeStep = (stepIndex: number) => {
    if (stepIndex > 4) return

    setNodes((prev) => {
      const copy = [...prev]
      
      if (stepIndex === 1) {
        copy[0] = { ...copy[0], status: "success", duration: "1.2s" }
        copy[1] = { ...copy[1], status: "running" }
      } else if (stepIndex === 2) {
        copy[1] = { ...copy[1], status: "success", duration: "840ms" }
        copy[2] = { ...copy[2], status: "running" }
        copy[3] = { ...copy[3], status: "running" }
      } else if (stepIndex === 3) {
        copy[2] = { ...copy[2], status: "success", duration: "610ms" }
        copy[3] = { ...copy[3], status: "success", duration: "420ms" }
        copy[4] = { ...copy[4], status: "running" }
      } else if (stepIndex === 4) {
        copy[4] = { ...copy[4], status: "success", duration: "180ms" }
      }
      return copy
    })

    const targetNodeMap: Record<number, string> = {
      1: "db:up",
      2: "db:migrate",
      3: "backend:build",
      4: "app:start"
    }

    const currentId = targetNodeMap[stepIndex]
    if (currentId) {
      setSelectedNodeId(currentId)
      const targetNode = INITIAL_NODES.find((n) => n.id === currentId)
      if (targetNode) {
        setTerminalLogs((prev) => [
          ...prev,
          `\n> Executing Task: ${targetNode.cmd}`,
          ...targetNode.logs
        ])
      }
    }
  }

  // Next step handler
  const handleNextStep = () => {
    if (currentStep >= 4) return
    const next = currentStep + 1
    setCurrentStep(next)
    
    if (next === 1) {
      setNodes((prev) => prev.map((n) => (n.id === "db:up" ? { ...n, status: "running" } : n)))
      setTimeout(() => executeStep(1), 600)
    } else {
      executeStep(next)
    }
  }

  // Auto play effect
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep >= 4) {
          setIsPlaying(false)
          clearInterval(timer)
          return prevStep
        }
        const next = prevStep + 1
        executeStep(next)
        return next
      })
    }, 1200)

    return () => clearInterval(timer)
  }, [isPlaying])

  const startAutoPlay = () => {
    resetDemo()
    setIsPlaying(true)
    setCurrentStep(1)
    setNodes((prev) => prev.map((n) => (n.id === "db:up" ? { ...n, status: "running" } : n)))
    setTimeout(() => executeStep(1), 400)
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0]

  const getTechBadge = (tech: WorkflowNode["tech"]) => {
    switch (tech) {
      case "docker":
        return <Badge variant="cyan">DOCKER</Badge>
      case "golang":
        return <Badge variant="teal">GOLANG</Badge>
      case "react":
        return <Badge variant="emerald">REACT</Badge>
      case "orchestra":
        return <Badge variant="violet">ORCHESTRA</Badge>
    }
  }

  return (
    <section id="demo" className="py-16 relative z-10 border-b border-white/12 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <Badge variant="emerald">
            <Sparkles className="w-3 h-3 mr-1.5 text-[#10b981]" />
            INTERACTIVE STEPPING DEMO
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-sans">
            SEE THE WORKFLOW ENGINE IN ACTION
          </h2>
          <p className="text-white/70 font-sans text-sm sm:text-base leading-relaxed body-md">
            Experience how Orchestra orchestrates a full-stack monorepo pipeline 
            (Docker Database → Golang Migration → Parallel Go Backend & React Frontend Builds → App Launch).
          </p>
        </div>

        {/* Demo Surface Card (Clean Canvas, Crisp Borders, Animated) */}
        <Card className="bg-[#0d0d0d] border border-white/15 p-6 sm:p-8 rounded-none space-y-6 transition-all duration-300">
          
          {/* Controls & View Switcher Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/12">
            
            {/* Left Tabs */}
            <div className="flex items-center gap-2 font-mono">
              <Button
                variant={activeTab === "graph" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("graph")}
                className={`h-9 px-4 text-xs font-mono font-bold uppercase rounded-none transition-all duration-200 ${
                  activeTab === "graph"
                    ? "bg-[#e1f4f3] text-[#0d0d0d] shadow-[0_0_15px_rgba(225,244,243,0.3)]"
                    : "border-white/20 bg-[#0d0d0d] text-white/70 hover:border-white/40 hover:text-white"
                }`}
              >
                <GitBranch className="w-4 h-4 mr-1.5" />
                VISUAL WORKFLOW GRAPH
              </Button>
              
              <Button
                variant={activeTab === "yaml" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("yaml")}
                className={`h-9 px-4 text-xs font-mono font-bold uppercase rounded-none transition-all duration-200 ${
                  activeTab === "yaml"
                    ? "bg-[#e1f4f3] text-[#0d0d0d] shadow-[0_0_15px_rgba(225,244,243,0.3)]"
                    : "border-white/20 bg-[#0d0d0d] text-white/70 hover:border-white/40 hover:text-white"
                }`}
              >
                <FileCode className="w-4 h-4 mr-1.5" />
                orchestra.yaml
              </Button>
            </div>

            {/* Right Action Stepper Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleNextStep}
                disabled={currentStep >= 4 || isPlaying}
                size="sm"
                className="h-9 px-4 bg-[#e1f4f3] text-[#0d0d0d] hover:bg-[#c2d8d7] font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>NEXT STEP ({currentStep}/4)</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <Button
                onClick={startAutoPlay}
                disabled={isPlaying}
                variant="outline"
                size="sm"
                className="h-9 px-4 border-[#06b6d4] bg-[#0d0d0d] text-[#06b6d4] hover:bg-[#06b6d4]/10 font-mono text-xs font-bold uppercase rounded-none transition-all duration-200 hover:-translate-y-0.5"
              >
                {isPlaying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#06b6d4]" />
                    AUTO EXECUTING...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-1.5 text-[#06b6d4] fill-[#06b6d4]" />
                    AUTO PLAY
                  </>
                )}
              </Button>

              <Button
                onClick={resetDemo}
                variant="outline"
                size="sm"
                className="h-9 px-3 border-white/20 bg-[#0d0d0d] text-white font-mono text-xs hover:border-white/40 rounded-none transition-all duration-200"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                RESET
              </Button>
            </div>

          </div>

          {/* TAB 1: VISUAL WORKFLOW GRAPH */}
          {activeTab === "graph" && (
            <div className="space-y-6">
              
              {/* Topological Level Graph Layout */}
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-xs text-white/70">
                  <span className="flex items-center gap-2 uppercase tracking-wider font-bold">
                    TOPOLOGICAL EXECUTION PIPELINE
                  </span>
                  <span className="text-white/40">Click node to inspect logs</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#0d0d0d] border border-white/15">
                  
                  {/* LEVEL 1 */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono text-[#06b6d4] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      LEVEL 1 :: DATABASE
                    </div>
                    <WorkflowNodeCard
                      node={nodes[0]}
                      isSelected={selectedNodeId === nodes[0].id}
                      onClick={() => setSelectedNodeId(nodes[0].id)}
                    />
                  </div>

                  {/* LEVEL 2 */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono text-[#14b8a6] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5" />
                      LEVEL 2 :: MIGRATION
                    </div>
                    <WorkflowNodeCard
                      node={nodes[1]}
                      isSelected={selectedNodeId === nodes[1].id}
                      onClick={() => setSelectedNodeId(nodes[1].id)}
                    />
                  </div>

                  {/* LEVEL 3 (PARALLEL) */}
                  <div className="space-y-3 md:col-span-1">
                    <div className="text-[11px] font-mono text-[#10b981] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      LEVEL 3 :: PARALLEL BUILDS
                    </div>
                    <div className="space-y-3">
                      <WorkflowNodeCard
                        node={nodes[2]}
                        isSelected={selectedNodeId === nodes[2].id}
                        onClick={() => setSelectedNodeId(nodes[2].id)}
                      />
                      <WorkflowNodeCard
                        node={nodes[3]}
                        isSelected={selectedNodeId === nodes[3].id}
                        onClick={() => setSelectedNodeId(nodes[3].id)}
                      />
                    </div>
                  </div>

                  {/* LEVEL 4 */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono text-[#8b5cf6] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5" />
                      LEVEL 4 :: LAUNCH APP
                    </div>
                    <WorkflowNodeCard
                      node={nodes[4]}
                      isSelected={selectedNodeId === nodes[4].id}
                      onClick={() => setSelectedNodeId(nodes[4].id)}
                    />
                  </div>

                </div>
              </div>

              {/* Bottom Details & Live Terminal Output Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Node Detail Card */}
                <div className="p-4 bg-[#0d0d0d] border border-white/15 font-mono text-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-white font-bold uppercase tracking-wider">NODE INSPECTOR</span>
                    {getTechBadge(selectedNode.tech)}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-1 font-sans">{selectedNode.name}</h4>
                    <p className="text-white/70 text-[11px] font-mono bg-[#0d0d0d] p-2 border border-white/15 truncate">
                      $ {selectedNode.cmd}
                    </p>
                  </div>

                  <div className="space-y-2 text-[11px] text-white/70">
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className={`font-bold uppercase ${
                        selectedNode.status === "success"
                          ? "text-[#10b981]"
                          : selectedNode.status === "running"
                          ? "text-[#06b6d4]"
                          : "text-white/40"
                      }`}>
                        {selectedNode.status} {selectedNode.duration && `(${selectedNode.duration})`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Execution Level:</span>
                      <span className="text-white font-bold">Level {selectedNode.level}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Dependencies:</span>
                      <span className="text-white">
                        {selectedNode.deps.length > 0 ? selectedNode.deps.join(", ") : "None (Root Task)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Console Terminal Panel */}
                <div className="lg:col-span-2 p-4 bg-[#0d0d0d] border border-white/15 font-mono text-xs flex flex-col h-[260px] rounded-none">
                  <div className="flex items-center justify-between border-b border-white/12 pb-2 text-white/70">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#10b981]" />
                      <span className="font-bold text-white uppercase">CONSOLE STREAM :: [{selectedNode.name}]</span>
                    </div>
                    <Badge variant="emerald">LIVE CONSOLE</Badge>
                  </div>

                  <div className="mt-3 flex-1 overflow-y-auto space-y-1 font-mono text-[12px] text-white leading-relaxed pr-2">
                    {terminalLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={
                          log.includes(">")
                            ? "text-[#06b6d4] font-bold"
                            : log.includes("Full stack application active")
                            ? "text-[#10b981] font-bold"
                            : log.includes("✔") || log.includes("✓")
                            ? "text-[#10b981]"
                            : log.includes("[docker]")
                            ? "text-[#06b6d4]"
                            : log.includes("[golang]")
                            ? "text-[#14b8a6]"
                            : log.includes("[vite]")
                            ? "text-[#10b981]"
                            : "text-white/70"
                        }
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: YAML DEFINITION */}
          {activeTab === "yaml" && (
            <div className="p-5 bg-[#0d0d0d] border border-white/15 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-white/70 mb-4">
                <span className="text-[#e1f4f3] font-bold uppercase">orchestra.yaml (Full-Stack Monorepo Pipeline)</span>
                <span className="text-white/40">Pure YAML 1.2 Format</span>
              </div>
              <pre className="text-[#e1f4f3] leading-relaxed overflow-x-auto text-[12px] font-mono">
                <code>{SAMPLE_YAML}</code>
              </pre>
            </div>
          )}

        </Card>
      </div>
    </section>
  )
}

function WorkflowNodeCard({
  node,
  isSelected,
  onClick
}: {
  node: WorkflowNode
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`p-3.5 bg-[#0d0d0d] border font-mono cursor-pointer transition-all duration-300 text-left rounded-none ${
        isSelected
          ? "border-[#e1f4f3] shadow-[0_0_15px_rgba(225,244,243,0.2)]"
          : node.status === "running"
          ? "border-[#06b6d4] animate-pulse-cyan"
          : node.status === "success"
          ? "border-[#10b981]"
          : "border-white/15 hover:border-white/40 hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-white truncate">{node.name}</span>
        {node.status === "success" && <Check className="w-4 h-4 text-[#10b981] shrink-0" />}
        {node.status === "running" && <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-ping shrink-0" />}
        {node.status === "idle" && <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />}
      </div>

      <p className="text-[10px] text-white/60 truncate mb-2 leading-none">{node.cmd}</p>

      <div className="flex items-center justify-between text-[10px]">
        <span className="text-white/40 truncate max-w-[80px]">
          {node.deps.length > 0 ? node.deps.join(",") : "root"}
        </span>
        <span
          className={`font-bold px-1 py-0.5 text-[9px] uppercase ${
            node.status === "success"
              ? "bg-[#10b981]/20 text-[#10b981]"
              : node.status === "running"
              ? "bg-[#06b6d4]/20 text-[#06b6d4]"
              : "bg-[#0d0d0d] text-white/40"
          }`}
        >
          {node.status.toUpperCase()} {node.duration && `(${node.duration})`}
        </span>
      </div>
    </div>
  )
}
