"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Download, 
  Terminal, 
  Monitor, 
  Check, 
  Copy, 
  Box, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from "lucide-react"

type PlatformKey = "linux" | "macos" | "windows" | "cli"

export function DownloadsSection() {
  const [activePlatform, setActivePlatform] = useState<PlatformKey>("linux")
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCmd(text)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  return (
    <section id="downloads" className="py-16 relative z-10 border-b border-white/12 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="emerald">
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#10b981]" />
            CROSS-PLATFORM INSTALLERS
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-sans">
            CHOOSE YOUR DISTRO & PLATFORM
          </h2>
          <p className="text-white/70 font-sans text-sm sm:text-base leading-relaxed body-md">
            Orchestra builds native binaries for every major Linux distribution, macOS architecture, 
            and Windows version. Pick your package format below.
          </p>
        </div>

        {/* Platform Selection Tabs */}
        <Tabs
          value={activePlatform}
          onValueChange={(val) => setActivePlatform(val as PlatformKey)}
          className="w-full space-y-8"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-3xl mx-auto h-auto p-1 bg-[#0d0d0d] border border-white/15 font-mono text-xs rounded-none">
            <TabsTrigger
              value="linux"
              className="py-3 font-sans font-bold uppercase text-xs data-[state=active]:bg-[#0d0d0d] data-[state=active]:text-[#e1f4f3] data-[state=active]:border-[#10b981] rounded-none flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Terminal className="w-4 h-4 text-[#10b981]" />
              <span>LINUX DISTROS</span>
            </TabsTrigger>

            <TabsTrigger
              value="macos"
              className="py-3 font-sans font-bold uppercase text-xs data-[state=active]:bg-[#0d0d0d] data-[state=active]:text-[#e1f4f3] data-[state=active]:border-[#06b6d4] rounded-none flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Monitor className="w-4 h-4 text-[#06b6d4]" />
              <span>MACOS</span>
            </TabsTrigger>

            <TabsTrigger
              value="windows"
              className="py-3 font-sans font-bold uppercase text-xs data-[state=active]:bg-[#0d0d0d] data-[state=active]:text-[#e1f4f3] data-[state=active]:border-[#14b8a6] rounded-none flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Box className="w-4 h-4 text-[#14b8a6]" />
              <span>WINDOWS</span>
            </TabsTrigger>

            <TabsTrigger
              value="cli"
              className="py-3 font-sans font-bold uppercase text-xs data-[state=active]:bg-[#0d0d0d] data-[state=active]:text-[#e1f4f3] data-[state=active]:border-[#8b5cf6] rounded-none flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
              <span>TERMINAL / CLI</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: LINUX DISTROS */}
          <TabsContent value="linux" className="space-y-6">
            <div className="text-center font-mono text-xs text-white/60">
              Showing native packages for Ubuntu, Debian, Arch Linux, Fedora, RHEL, and Universal AppImage
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Ubuntu / Debian */}
              <DistroCard
                distroName="Ubuntu / Debian / Mint"
                packageName="Orchestra-1.0.0-amd64.deb"
                badgeText=".DEB PACKAGE"
                fileSize="~84 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0-amd64.deb"
                installCmd="sudo dpkg -i Orchestra-1.0.0-amd64.deb"
                onCopy={handleCopy}
                isCopied={copiedCmd === "sudo dpkg -i Orchestra-1.0.0-amd64.deb"}
              />

              {/* Arch Linux */}
              <DistroCard
                distroName="Arch Linux / Manjaro"
                packageName="Orchestra-1.0.0-x86_64.pkg.tar.zst"
                badgeText=".PACMAN PACKAGE"
                fileSize="~82 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0-x86_64.pkg.tar.zst"
                installCmd="sudo pacman -U Orchestra-1.0.0-x86_64.pkg.tar.zst"
                onCopy={handleCopy}
                isCopied={copiedCmd === "sudo pacman -U Orchestra-1.0.0-x86_64.pkg.tar.zst"}
              />

              {/* Fedora / RHEL */}
              <DistroCard
                distroName="Fedora / RHEL / CentOS"
                packageName="Orchestra-1.0.0.x86_64.rpm"
                badgeText=".RPM PACKAGE"
                fileSize="~85 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0.x86_64.rpm"
                installCmd="sudo dnf install ./Orchestra-1.0.0.x86_64.rpm"
                onCopy={handleCopy}
                isCopied={copiedCmd === "sudo dnf install ./Orchestra-1.0.0.x86_64.rpm"}
              />

              {/* Universal AppImage */}
              <DistroCard
                distroName="Universal Linux (Any Distro)"
                packageName="Orchestra-1.0.0.AppImage"
                badgeText="APPIMAGE (STANDALONE)"
                fileSize="~88 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0.AppImage"
                installCmd="chmod +x Orchestra-1.0.0.AppImage && ./Orchestra-1.0.0.AppImage"
                onCopy={handleCopy}
                isCopied={copiedCmd === "chmod +x Orchestra-1.0.0.AppImage && ./Orchestra-1.0.0.AppImage"}
              />

              {/* Compressed Archive */}
              <DistroCard
                distroName="Standalone Tarball Archive"
                packageName="Orchestra-1.0.0.tar.gz"
                badgeText=".TAR.GZ ARCHIVE"
                fileSize="~80 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0.tar.gz"
                installCmd="tar -xzf Orchestra-1.0.0.tar.gz"
                onCopy={handleCopy}
                isCopied={copiedCmd === "tar -xzf Orchestra-1.0.0.tar.gz"}
              />

              {/* Linux Info Helper */}
              <Card className="p-6 bg-[#0d0d0d] border border-white/15 font-mono text-xs flex flex-col justify-between space-y-4 rounded-none transition-all duration-300 hover:border-white/35">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#10b981] font-bold uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    <span>LINUX SECURITY & PERMISSIONS</span>
                  </div>
                  <p className="text-white/70 font-sans text-xs leading-relaxed">
                    All Linux packages include desktop environment shortcuts, protocol handler registrations, 
                    and PTY terminal execution permissions out of the box.
                  </p>
                </div>
                <div className="text-[11px] text-white/40 border-t border-white/10 pt-3">
                  Target Arch: <span className="text-white font-bold">x86_64 / amd64</span>
                </div>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 2: MACOS */}
          <TabsContent value="macos" className="space-y-6">
            <div className="text-center font-mono text-xs text-white/60">
              Apple Silicon (M1/M2/M3/M4) & Intel 64-bit Universal Mac Installers
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Apple Silicon */}
              <DistroCard
                distroName="macOS (Apple Silicon)"
                packageName="Orchestra-1.0.0-arm64.dmg"
                badgeText="M1 / M2 / M3 / M4 (.DMG)"
                fileSize="~76 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0-arm64.dmg"
              />

              {/* Intel Mac */}
              <DistroCard
                distroName="macOS (Intel Processor)"
                packageName="Orchestra-1.0.0-x64.dmg"
                badgeText="INTEL 64-BIT (.DMG)"
                fileSize="~79 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0-x64.dmg"
              />

              {/* macOS Zip */}
              <DistroCard
                distroName="macOS Portable Zip"
                packageName="Orchestra-1.0.0-mac.zip"
                badgeText="PORTABLE (.ZIP)"
                fileSize="~75 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0-mac.zip"
              />

            </div>
          </TabsContent>

          {/* TAB 3: WINDOWS */}
          <TabsContent value="windows" className="space-y-6">
            <div className="text-center font-mono text-xs text-white/60">
              Standard Windows Setup, Zero-Install Portable, and Enterprise MSI Installers
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Windows Setup EXE */}
              <DistroCard
                distroName="Windows NSIS Installer"
                packageName="Orchestra.Setup.1.0.0.exe"
                badgeText="EXE INSTALLER"
                fileSize="~85 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra.Setup.1.0.0.exe"
              />

              {/* Windows Portable */}
              <DistroCard
                distroName="Windows Portable"
                packageName="Orchestra.1.0.0.Portable.exe"
                badgeText="PORTABLE EXE"
                fileSize="~86 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra.1.0.0.Portable.exe"
              />

              {/* Windows MSI */}
              <DistroCard
                distroName="Windows Enterprise MSI"
                packageName="Orchestra-1.0.0.msi"
                badgeText="MSI PACKAGE"
                fileSize="~88 MB"
                downloadUrl="https://github.com/jsndz/orchestra/releases/latest/download/Orchestra-1.0.0.msi"
              />

            </div>
          </TabsContent>

          {/* TAB 4: TERMINAL / CLI */}
          <TabsContent value="cli" className="space-y-6">
            <div className="max-w-3xl mx-auto space-y-6 font-mono text-xs">
              
              <Card className="p-6 bg-[#0d0d0d] border border-white/15 space-y-4 rounded-none">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[#e1f4f3] font-bold uppercase flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#10b981]" />
                    AUTOMATED LINUX/MACOS INSTALL SCRIPT
                  </span>
                  <Badge variant="emerald">BASH SCRIPT</Badge>
                </div>

                <p className="text-white/70 font-sans text-xs leading-relaxed">
                  Run this command in your terminal to automatically detect your operating system 
                  and download the matching Orchestra package:
                </p>

                <div className="relative bg-[#0d0d0d] border border-white/15 p-4 text-white flex items-center justify-between rounded-none font-mono text-xs">
                  <code>curl -fsSL https://raw.githubusercontent.com/jsndz/orchestra/main/scripts/install.sh | bash</code>
                  <Button
                    size="sm"
                    onClick={() => handleCopy("curl -fsSL https://raw.githubusercontent.com/jsndz/orchestra/main/scripts/install.sh | bash")}
                    className="ml-3 bg-[#e1f4f3] text-[#0d0d0d] hover:bg-[#c2d8d7] h-8 text-[11px] font-bold rounded-none"
                  >
                    {copiedCmd === "curl -fsSL https://raw.githubusercontent.com/jsndz/orchestra/main/scripts/install.sh | bash" ? (
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </Card>

            </div>
          </TabsContent>

        </Tabs>

        {/* GitHub Releases Link Footer */}
        <div className="mt-14 text-center">
          <a
            href="https://github.com/jsndz/orchestra/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs text-white/60 hover:text-[#e1f4f3] transition-colors uppercase tracking-wider"
          >
            <span>VIEW PAST RELEASES, SHA-256 CHECKSUMS & SOURCE CODE ON GITHUB RELEASES</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  )
}

function DistroCard({
  distroName,
  packageName,
  badgeText,
  fileSize,
  downloadUrl,
  installCmd,
  onCopy,
  isCopied
}: {
  distroName: string
  packageName: string
  badgeText: string
  fileSize: string
  downloadUrl: string
  installCmd?: string
  onCopy?: (text: string) => void
  isCopied?: boolean
}) {
  return (
    <Card className="p-6 bg-[#0d0d0d] border border-white/15 rounded-none flex flex-col justify-between space-y-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#10b981]/60 hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="emerald">
            {badgeText}
          </Badge>
          <span className="text-[11px] font-mono text-white/40">{fileSize}</span>
        </div>

        <div>
          <h3 className="text-base font-sans font-bold text-white uppercase tracking-wider">
            {distroName}
          </h3>
          <p className="text-xs font-mono text-white/60 truncate mt-1">
            {packageName}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {installCmd && (
          <div className="bg-[#0d0d0d] border border-white/15 p-2.5 rounded-none font-mono text-[11px] text-[#e1f4f3] flex items-center justify-between">
            <span className="truncate mr-2">{installCmd}</span>
            {onCopy && (
              <button
                onClick={() => onCopy(installCmd)}
                className="text-white/60 hover:text-[#e1f4f3] shrink-0 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        )}

        <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
          <Button className="w-full bg-[#e1f4f3] text-[#0d0d0d] hover:bg-[#c2d8d7] font-mono font-bold text-xs uppercase tracking-wider h-10 flex items-center justify-center gap-2 rounded-none transition-all duration-200">
            <Download className="w-4 h-4" />
            <span>DOWNLOAD {packageName.split(".").pop()?.toUpperCase()}</span>
          </Button>
        </a>
      </div>
    </Card>
  )
}
