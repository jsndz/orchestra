import { Metadata } from "next"
import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/Hero"
import { InteractiveDemo } from "@/components/InteractiveDemo"
import { Features } from "@/components/Features"
import { McpSection } from "@/components/McpSection"
import { DownloadsSection } from "@/components/DownloadsSection"
import { GitHubLogoIcon } from "@radix-ui/react-icons"

export const metadata: Metadata = {
  title: "Orchestra | Local-First Workflow Orchestration for Developers",
  description: "Monitor complex task dependencies with real-time graph visualization, streaming terminal logs, pure YAML config, and Model Context Protocol (MCP) AI assistant control.",
  keywords: ["workflow orchestration", "task runner", "visual execution", "YAML pipelines", "developer tools", "local first", "mcp", "electron"],
  authors: [{ name: "Jaison Dsouza" }],
  openGraph: {
    title: "Orchestra | Local-First Workflow Orchestration",
    description: "Visual execution and real-time monitoring for developers. Pure YAML-native and local-first.",
    type: "website",
    url: "https://orchestra.sh",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Orchestra Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orchestra | Workflow Orchestration",
    description: "Visual execution and real-time monitoring for developers.",
    images: ["/icon.png"],
  },
}

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-[#e1f4f3] selection:text-[#0d0d0d] font-sans relative overflow-x-hidden">
      
      {/* Navigation Header */}
      <Navbar />

      {/* Main Sections */}
      <main className="relative z-10 pt-[56px]">
        <Hero />
        <InteractiveDemo />
        <Features />
        <McpSection />
        <DownloadsSection />
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/12 bg-[#0d0d0d] py-8 font-mono text-xs text-white/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-white font-bold uppercase tracking-wider">
              ORCHESTRA v1.0.0
            </span>
            <span className="text-white/30">|</span>
            <span className="text-white/60 font-sans">
              Local-First Desktop Workflow Engine
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/jsndz/orchestra"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#e1f4f3] transition-colors flex items-center gap-1.5"
            >
              <GitHubLogoIcon className="w-4 h-4" />
              <span>GitHub Repository</span>
            </a>

            <a
              href="#downloads"
              className="hover:text-[#e1f4f3] transition-colors"
            >
              Distros & Downloads
            </a>

            <span className="text-white/30">|</span>

            <span className="text-white/60 flex items-center gap-1">
              MIT License
            </span>
          </div>

        </div>
      </footer>

    </div>
  )
}
