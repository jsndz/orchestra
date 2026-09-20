import { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Orchestra | Desktop Workflow Orchestrator",
    template: "%s | Orchestra",
  },
  description: "Engineering-grade desktop workflow orchestrator organized around visual workflow graphs, streaming terminal outputs, and MCP AI controls.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased dark", inter.variable, jetbrainsMono.variable)}
    >
      <body className="bg-[#0d0d0d] text-white font-sans selection:bg-[#e1f4f3] selection:text-[#0d0d0d]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

