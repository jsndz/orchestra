import Image from "next/image"
import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { 
  Terminal, 
  Cpu, 
  GitBranch, 
  Download, 
  Monitor, 
  LayoutGrid, 
  Workflow
} from "lucide-react"
import { GitHubLogoIcon } from "@radix-ui/react-icons"

export const metadata: Metadata = {
  title: "Orchestra | Open Source Workflow Orchestration",
  description: "Monitor complex task dependencies with real-time graph visualization and live logs. Built for the developer's machine with pure YAML configuration.",
  keywords: ["workflow orchestration", "task runner", "visual execution", "YAML pipelines", "developer tools", "open source"],
  authors: [{ name: "Jaison Dsouza" }],
  openGraph: {
    title: "Orchestra | Open Source Workflow Orchestration",
    description: "Visual execution and real-time monitoring for  developers. YAML-native and local-first.",
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
    description: "Visual execution and real-time monitoring for  developers.",
    images: ["/icon.png"],
  },
}

export default function Page() {
  return (
    <main className="h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-background overflow-hidden">
      {/* Background Subtle Gradient & Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--card)_0%,_transparent_70%)] opacity-20 pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none dot-grid" />

      {/* Header */}
      <header className="relative z-50 w-full h-16 border-b border-border/10 bg-background/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="logo"
            width={24}
            height={24}
            className="filter grayscale brightness-200"
          />
          <h1 className="text-sm font-black tracking-[0.2em] uppercase">
            ORCHESTRA
          </h1>
        </div>
        
        <a 
          href="https://github.com/jsndz/orchestra" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="h-8 rounded-none border-border/20 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black">
            <GitHubLogoIcon className="mr-2 h-3.5 w-3.5" />
            GitHub
          </Button>
        </a>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          {/* Logo with Glow */}
          <div className="group relative">
            <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse" />
            <Image
              src="/icon.png"
              alt="logo"
              width={100}
              height={100}
              className="relative z-10 filter grayscale brightness-200 group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Title & Tagline */}
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none italic">
              ORCHESTRA
            </h2>
            <p className="text-[10px] text-muted-foreground tracking-[0.4em] uppercase font-medium max-w-lg mx-auto leading-relaxed">
              Open Source Workflow Orchestration for Developers
            </p>
          </div>

          {/* Download Buttons */}
          <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-3">
            <DownloadButton 
              label="macOS" 
              subLabel="Universal Binary"
              icon={<Monitor className="h-4 w-4" />}
            />
            <DownloadButton 
              label="Windows" 
              subLabel="x64 Installer"
              icon={<LayoutGrid className="h-4 w-4" />}
            />
            <DownloadButton 
              label="Linux" 
              subLabel=".AppImage / .deb"
              icon={<Terminal className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 border-t border-border/5 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          <FeatureItem 
            icon={<Workflow className="h-5 w-5" />}
            title="Visual Execution"
            description="Monitor complex task dependencies with real-time graph visualization and live logs."
          />
          <FeatureItem 
            icon={<GitBranch className="h-5 w-5" />}
            title="YAML Native"
            description="Pure YAML configuration. No proprietary DSLs, no vendor lock-in, just clean pipelines."
          />
          <FeatureItem 
            icon={<Cpu className="h-5 w-5" />}
            title="Local First"
            description="Direct environment access with zero-latency orchestration. Built for the developer's machine."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-50 w-full border-t border-border/5 bg-background/80 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[7px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
              Environment::Production
            </span>
          </div>

          <div className="flex items-center gap-8">
             <span className="hidden md:inline text-[7px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em]">
              Orchestra_v1.0.0-Beta
            </span>
            <span className="text-[7px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">
              MIT License
            </span>
          </div>
        </div>
      </footer>
    </main>
  )
}

function DownloadButton({ label, subLabel, icon }: { label: string, subLabel: string, icon: React.ReactNode }) {
  return (
    <Button className="group h-16 bg-card border border-border/10 rounded-none flex flex-col items-center justify-center gap-1 hover:bg-accent hover:text-background transition-all duration-300 relative overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="text-accent group-hover:text-background transition-colors">{icon}</span>
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-[7px] font-mono text-muted-foreground group-hover:text-background/70 uppercase tracking-tighter">
        {subLabel}
      </span>
      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Download className="h-3 w-3" />
      </div>
    </Button>
  )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col gap-3 group">
      <div className="w-8 h-8 flex items-center justify-center bg-card border border-border/10 text-accent group-hover:glow-accent transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent/80 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  )
}
