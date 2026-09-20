"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Download, Sparkles, Menu, X } from "lucide-react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[56px] bg-[#0d0d0d]/95 backdrop-blur-md border-b border-white/12 rounded-none">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Brand */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-8 h-8 flex items-center justify-center bg-[#0d0d0d] border border-white/20 group-hover:border-[#10b981] group-hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-300">
            <Image
              src="/icon.png"
              alt="Orchestra Logo"
              width={20}
              height={20}
              className="brightness-200 group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-sm tracking-[0.15em] text-white uppercase">
                ORCHESTRA
              </span>
              <Badge variant="emerald" className="px-1 py-0 text-[9px] h-4">
                v1.0.0
              </Badge>
            </div>
            <span className="text-[10px] font-mono text-white/60 tracking-wider hidden sm:inline leading-none">
              Local-First Workflow Orchestrator
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs">
          <a
            href="#demo"
            className="text-white/80 hover:text-[#10b981] transition-all duration-200 tracking-wide flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
            Interactive Demo
          </a>
          <a
            href="#features"
            className="text-white/80 hover:text-[#10b981] transition-all duration-200 tracking-wide"
          >
            Features
          </a>
          <a
            href="#mcp"
            className="text-white/80 hover:text-[#10b981] transition-all duration-200 tracking-wide"
          >
            MCP AI Integration
          </a>
          <a
            href="#downloads"
            className="text-white/80 hover:text-[#10b981] transition-all duration-200 tracking-wide"
          >
            Distros & Downloads
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/jsndz/orchestra"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-mono tracking-wider border-white/20"
            >
              <GitHubLogoIcon className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </a>

          <a href="#downloads">
            <Button
              size="sm"
              className="h-8 px-4 bg-[#e1f4f3] text-[#0d0d0d] hover:bg-[#c2d8d7] font-mono font-bold text-xs tracking-wider"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download App
            </Button>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:text-[#10b981] transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d0d] border-b border-white/15 px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-4 font-mono text-xs">
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-[#10b981] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              Interactive Demo
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-[#10b981]"
            >
              Features
            </a>
            <a
              href="#mcp"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-[#10b981]"
            >
              MCP AI Integration
            </a>
            <a
              href="#downloads"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-[#10b981]"
            >
              Distros & Downloads
            </a>
          </nav>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <a href="#downloads" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-[#e1f4f3] text-[#0d0d0d] font-mono font-bold">
                <Download className="w-4 h-4 mr-2" />
                Download Orchestra
              </Button>
            </a>
            <a
              href="https://github.com/jsndz/orchestra"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full border-white/20 font-mono text-white">
                <GitHubLogoIcon className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
