import { ipcMain } from "electron";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createMCPserver } from "../../../shared/dist/node.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let httpMcpServer: ReturnType<typeof createMCPserver> | null = null;
let currentServerPort = 3030;
let isServerRunning = false;
let currentAuthToken = crypto.randomBytes(16).toString("hex");

export function getMcpAuthToken(): string {
  if (!currentAuthToken) {
    currentAuthToken = crypto.randomBytes(16).toString("hex");
  }
  return currentAuthToken;
}

export function getMcpServerStatus(): { running: boolean; port: number; token: string } {
  return { running: isServerRunning, port: currentServerPort, token: getMcpAuthToken() };
}

export function startMcpServer(port: number = 3030): { success: boolean; port: number; token: string; error?: string } {
  const token = getMcpAuthToken();
  if (isServerRunning && httpMcpServer) {
    return { success: true, port: currentServerPort, token };
  }

  try {
    currentServerPort = port;
    httpMcpServer = createMCPserver(port, token);
    httpMcpServer.start("127.0.0.1");
    isServerRunning = true;
    return { success: true, port: currentServerPort, token };
  } catch (err: unknown) {
    isServerRunning = false;
    httpMcpServer = null;
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, port: currentServerPort, token, error: message };
  }
}

export function stopMcpServer(): { success: boolean; error?: string } {
  if (!httpMcpServer && !isServerRunning) {
    return { success: true };
  }

  try {
    httpMcpServer?.stop();
    httpMcpServer = null;
    isServerRunning = false;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

function getMcpCliEntrypoint(): string {
  // Resolve path to packages/mcp-cli/dist/index.js or packages/mcp-cli/src/index.ts
  const candidateDistPath = path.resolve(__dirname, "../../../mcp-cli/dist/index.js");
  if (fs.existsSync(candidateDistPath)) {
    return candidateDistPath;
  }
  const candidateSrcPath = path.resolve(__dirname, "../../../mcp-cli/src/index.ts");
  if (fs.existsSync(candidateSrcPath)) {
    return candidateSrcPath;
  }
  const candidateRootDist = path.resolve(process.cwd(), "packages/mcp-cli/dist/index.js");
  if (fs.existsSync(candidateRootDist)) {
    return candidateRootDist;
  }
  const candidateRootSrc = path.resolve(process.cwd(), "packages/mcp-cli/src/index.ts");
  if (fs.existsSync(candidateRootSrc)) {
    return candidateRootSrc;
  }
  return candidateDistPath;
}

function getCandidateInstallPaths(): string[] {
  const isWindows = process.platform === "win32";
  const home = os.homedir();

  if (isWindows) {
    const localAppData = process.env.LOCALAPPDATA || path.join(home, "AppData", "Local");
    return [
      path.join(localAppData, "Microsoft", "WindowsApps", "orchestra-mcp.cmd"),
      path.join(home, ".orchestra", "bin", "orchestra-mcp.cmd")
    ];
  } else {
    return [
      "/usr/local/bin/orchestra-mcp",
      path.join(home, ".local", "bin", "orchestra-mcp"),
      path.join(home, "bin", "orchestra-mcp")
    ];
  }
}

export function checkMcpCliStatus(): { installed: boolean; path: string | null } {
  const candidates = getCandidateInstallPaths();
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return { installed: true, path: candidate };
    }
  }
  return { installed: false, path: null };
}

export function installMcpCli(): { success: boolean; path: string; error?: string } {
  const isWindows = process.platform === "win32";
  const home = os.homedir();
  const entrypoint = getMcpCliEntrypoint();

  let targetDir = "";
  let targetPath = "";

  if (isWindows) {
    const localAppData = process.env.LOCALAPPDATA || path.join(home, "AppData", "Local");
    targetDir = path.join(localAppData, "Microsoft", "WindowsApps");
    targetPath = path.join(targetDir, "orchestra-mcp.cmd");
  } else {
    // Try /usr/local/bin first, fallback to ~/.local/bin
    const sysBin = "/usr/local/bin";
    try {
      if (fs.existsSync(sysBin)) {
        fs.accessSync(sysBin, fs.constants.W_OK);
        targetDir = sysBin;
      } else {
        targetDir = path.join(home, ".local", "bin");
      }
    } catch {
      targetDir = path.join(home, ".local", "bin");
    }
    targetPath = path.join(targetDir, "orchestra-mcp");
  }

  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const isTs = entrypoint.endsWith(".ts");
    const nodeFlags = isTs ? "--experimental-strip-types " : "";

    if (isWindows) {
      const cmdContent = `@echo off\r\nnode ${nodeFlags}"${entrypoint}" %*\r\n`;
      fs.writeFileSync(targetPath, cmdContent, "utf-8");
    } else {
      const shContent = `#!/bin/sh\n# Orchestra MCP CLI Launcher\nNODE_BIN=$(command -v node 2>/dev/null || echo "node")\nexec "$NODE_BIN" ${nodeFlags}"${entrypoint}" "$@"\n`;
      fs.writeFileSync(targetPath, shContent, { encoding: "utf-8", mode: 0o755 });
    }

    return { success: true, path: targetPath };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, path: "", error: message };
  }
}

export function uninstallMcpCli(): { success: boolean; error?: string } {
  const status = checkMcpCliStatus();
  if (!status.installed || !status.path) {
    return { success: true };
  }

  try {
    fs.unlinkSync(status.path);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

export function registerMcpIPC() {
  ipcMain.handle("mcp:server-status", () => {
    return getMcpServerStatus();
  });

  ipcMain.handle("mcp:server-start", (_, port?: number) => {
    return startMcpServer(port || 3030);
  });

  ipcMain.handle("mcp:server-stop", () => {
    return stopMcpServer();
  });

  ipcMain.handle("mcp:cli-status", () => {
    return checkMcpCliStatus();
  });

  ipcMain.handle("mcp:cli-install", () => {
    return installMcpCli();
  });

  ipcMain.handle("mcp:cli-uninstall", () => {
    return uninstallMcpCli();
  });
}
