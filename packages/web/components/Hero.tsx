"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Download, 
  Terminal, 
  Sparkles, 
  Cpu, 
  GitBranch, 
  ArrowRight,
  Zap
} from "lucide-react"

interface DetectedOS {
  name: string
  subLabel: string
  href: string
  iconName: "mac" | "win" | "linux"
  distroHint?: string
}

export function Hero() {
  const [detectedOS, setDetectedOS] = useState<DetectedOS>({
    name: "Linux / Universal",
    subLabel: ".AppImage Standalone",
    href: "https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0.AppImage",
    iconName: "linux",
    distroHint: "Universal AppImage"
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const ua = navigator.userAgent.toLowerCase()
    const platform = navigator.platform.toLowerCase()

    if (ua.includes("mac") || platform.includes("mac")) {
      const isArm = ua.includes("arm") || ua.includes("apple")
      setDetectedOS({
        name: "macOS",
        subLabel: isArm ? "Apple Silicon (.dmg)" : "Universal / Intel (.dmg)",
        href: "https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0-arm64.dmg",
        iconName: "mac"
      })
    } else if (ua.includes("win") || platform.includes("win")) {
      setDetectedOS({
        name: "Windows",
        subLabel: "x64 Installer (.exe)",
        href: "https://github.com/jsndz/orchestra/releases/latest/download/Orchestra.Setup.1.0.0.exe",
        iconName: "win"
      })
    } else if (ua.includes("ubuntu") || ua.includes("debian")) {
      setDetectedOS({
        name: "Ubuntu / Debian",
        subLabel: ".deb Package",
        href: "https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0-amd64.deb",
        iconName: "linux",
        distroHint: "Debian/Ubuntu Native"
      })
    } else if (ua.includes("arch") || ua.includes("manjaro")) {
      setDetectedOS({
        name: "Arch Linux",
        subLabel: ".pacman Package",
        href: "https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0-x86_64.pkg.tar.zst",
        iconName: "linux",
        distroHint: "Arch Linux Package"
      })
    } else if (ua.includes("fedora") || ua.includes("rhel") || ua.includes("centos")) {
      setDetectedOS({
        name: "Fedora / RHEL",
        subLabel: ".rpm Package",
        href: "https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0.x86_64.rpm",
        iconName: "linux",
        distroHint: "RPM Package"
      })
    } else if (ua.includes("linux")) {
      setDetectedOS({
        name: "Linux",
        subLabel: ".AppImage Standalone",
        href: "https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0.AppImage",
        iconName: "linux",
        distroHint: "Universal AppImage"
      })
    }
  }, [])

  return (
    <section className="relative pt-20 pb-16 bg-[#0d0d0d] border-b border-white/12">
      {/* Dynamic Background CAD Grid */}
      <div className="absolute inset-0 cad-grid opacity-25 pointer-events-none" />

      {/* Animated Subtle Ambient Light Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-teal-500/5 blur-[120px] rounded-full pointer-events-none animate-float" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0d0d0d] border border-white/20 text-[#e1f4f3] font-mono text-[11px] mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-float">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
          <span className="font-bold uppercase tracking-wider">LOCAL-FIRST WORKFLOW ENGINE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-4xl leading-tight uppercase font-sans">
          ORCHESTRATE LOCAL WORKFLOWS WITH{" "}
          <span className="text-[#e1f4f3] border-b-2 border-[#10b981] pb-0.5">
            ZERO LATENCY
          </span>
        </h1>

        {/* Hero Tagline */}
        <p className="mt-5 text-sm sm:text-base text-white/75 max-w-2xl leading-relaxed font-sans body-md">
          Monitor complex task dependency workflows natively on your desktop with visual graphs, 
          streaming terminal logs, pure YAML pipelines, and integrated AI assistant controls via MCP.
        </p>

        {/* Primary Download CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl">
          
          {/* Main Detected OS Button */}
          <a
            href={detectedOS.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto h-11 px-7 bg-[#e1f4f3] text-[#0d0d0d] hover:bg-[#c2d8d7] font-mono font-bold text-xs tracking-wider uppercase border border-[#e1f4f3] flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(225,244,243,0.3)]">
              <Download className="w-4 h-4" />
              <div className="flex flex-col items-start text-left leading-none">
                <span className="font-bold">DOWNLOAD FOR {detectedOS.name.toUpperCase()}</span>
                <span className="text-[10px] opacity-75 font-normal mt-0.5">{detectedOS.subLabel}</span>
              </div>
            </Button>
          </a>

          {/* View All Distros CTA */}
          <a href="#downloads" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-11 px-6 border-white/20 bg-[#0d0d0d] text-white hover:border-[#10b981] hover:text-[#10b981] font-mono text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Terminal className="w-4 h-4 text-[#10b981]" />
              <span>ALL DISTROS & FORMATS</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </Button>
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl text-left">
          
          <Card className="bg-[#0d0d0d] border border-white/15 p-4 flex items-center gap-3 rounded-none transition-all duration-300 hover:-translate-y-1 hover:border-[#10b981]/60 hover:shadow-[0_4px_20px_rgba(16,185,129,0.12)]">
            <div className="w-9 h-9 bg-[#0d0d0d] border border-white/20 flex items-center justify-center text-[#10b981] shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider">VISUAL WORKFLOW ENGINE</h4>
              <p className="text-[11px] font-mono text-white/60 leading-tight">Topological step resolution</p>
            </div>
          </Card>

          <Card className="bg-[#0d0d0d] border border-white/15 p-4 flex items-center gap-3 rounded-none transition-all duration-300 hover:-translate-y-1 hover:border-[#06b6d4]/60 hover:shadow-[0_4px_20px_rgba(6,182,212,0.12)]">
            <div className="w-9 h-9 bg-[#0d0d0d] border border-white/20 flex items-center justify-center text-[#06b6d4] shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider">PURE YAML NATIVE</h4>
              <p className="text-[11px] font-mono text-white/60 leading-tight">Zero vendor lock-in</p>
            </div>
          </Card>

          <Card className="bg-[#0d0d0d] border border-white/15 p-4 flex items-center gap-3 rounded-none transition-all duration-300 hover:-translate-y-1 hover:border-[#14b8a6]/60 hover:shadow-[0_4px_20px_rgba(20,184,166,0.12)]">
            <div className="w-9 h-9 bg-[#0d0d0d] border border-white/20 flex items-center justify-center text-[#14b8a6] shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider">100% LOCAL-FIRST</h4>
              <p className="text-[11px] font-mono text-white/60 leading-tight">Offline binary execution</p>
            </div>
          </Card>

          <Card className="bg-[#0d0d0d] border border-white/15 p-4 flex items-center gap-3 rounded-none transition-all duration-300 hover:-translate-y-1 hover:border-[#8b5cf6]/60 hover:shadow-[0_4px_20px_rgba(139,92,246,0.12)]">
            <div className="w-9 h-9 bg-[#0d0d0d] border border-white/20 flex items-center justify-center text-[#8b5cf6] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider">MCP PROTOCOL</h4>
              <p className="text-[11px] font-mono text-white/60 leading-tight">Antigravity / Cursor / Claude</p>
            </div>
          </Card>

        </div>

      </div>
    </section>
  )
}
