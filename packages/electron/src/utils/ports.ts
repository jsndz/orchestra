import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export type PortInfo = {
  inUse: boolean;
  pid?: number;
  command?: string;
};

/**
 * Checks if a TCP port is currently in use on localhost.
 * If in use, attempts to resolve the PID and command name of the owner process.
 */
export async function checkPort(port: number): Promise<PortInfo> {
  const platform = process.platform;
  try {
    if (platform === "win32") {
      // Find the PID using netstat
      const { stdout } = await execPromise(`netstat -ano`);
      const lines = stdout.split("\n");
      let pid: number | undefined;
      const targetStr = `:${port}`;
      for (const line of lines) {
        if (line.includes(targetStr) && line.includes("LISTENING")) {
          const parts = line.trim().split(/\s+/);
          const lastPart = parts[parts.length - 1];
          const parsedPid = parseInt(lastPart, 10);
          if (!isNaN(parsedPid)) {
            pid = parsedPid;
            break;
          }
        }
      }

      if (pid) {
        // Find command name using tasklist
        try {
          const { stdout: taskStdout } = await execPromise(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
          const match = taskStdout.match(/"([^"]+)"/);
          const command = match ? match[1] : "Unknown";
          return { inUse: true, pid, command };
        } catch {
          return { inUse: true, pid, command: "Unknown" };
        }
      }
    } else {
      // Unix: macOS/Linux
      // lsof -i :<port> -sTCP:LISTEN -F cp
      try {
        const { stdout } = await execPromise(`lsof -i :${port} -sTCP:LISTEN -F cp`);
        const lines = stdout.trim().split("\n");
        let pid: number | undefined;
        let command: string | undefined;
        for (const line of lines) {
          if (line.startsWith("p")) {
            pid = parseInt(line.substring(1), 10);
          } else if (line.startsWith("c")) {
            command = line.substring(1);
          }
        }
        if (pid) {
          return { inUse: true, pid, command: command || "Unknown" };
        }
      } catch (err: any) {
        // lsof returns exit code 1 if no matches found
        return { inUse: false };
      }
    }
  } catch (e) {
    console.error("Error checking port:", e);
  }
  return { inUse: false };
}

/**
 * Kills a process by PID.
 */
export async function killProcess(pid: number): Promise<void> {
  try {
    process.kill(pid, "SIGKILL");
  } catch (err: any) {
    if (err.code === "ESRCH") {
      return;
    }
    // If native kill fails, try system commands
    try {
      const platform = process.platform;
      if (platform === "win32") {
        await execPromise(`taskkill /F /PID ${pid}`);
      } else {
        await execPromise(`kill -9 ${pid}`);
      }
    } catch (sysErr: any) {
      if (sysErr.message && (sysErr.message.includes("No such process") || sysErr.message.includes("not found"))) {
        return;
      }
      throw sysErr;
    }
  }
}

/**
 * Resolves all descendant process PIDs of a root process ID.
 */
async function getDescendantPids(rootPid: number): Promise<number[]> {
  const platform = process.platform;
  const pids: number[] = [];
  const parentMap = new Map<number, number>();

  try {
    if (platform === "win32") {
      const { stdout } = await execPromise("wmic process get ProcessId,ParentProcessId");
      const lines = stdout.split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const ppid = parseInt(parts[0], 10);
          const pid = parseInt(parts[1], 10);
          if (!isNaN(pid) && !isNaN(ppid)) {
            parentMap.set(pid, ppid);
          }
        }
      }
    } else {
      const { stdout } = await execPromise("ps -o pid=,ppid=");
      const lines = stdout.split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const pid = parseInt(parts[0], 10);
          const ppid = parseInt(parts[1], 10);
          if (!isNaN(pid) && !isNaN(ppid)) {
            parentMap.set(pid, ppid);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error gathering process tree stats:", err);
  }

  const queue = [rootPid];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    if (current !== rootPid) {
      pids.push(current);
    }

    for (const [pid, ppid] of parentMap.entries()) {
      if (ppid === current) {
        queue.push(pid);
      }
    }
  }

  return pids;
}

/**
 * Kills a process and all of its descendants (the entire process tree).
 */
export async function killProcessTree(rootPid: number): Promise<void> {
  try {
    const descendants = await getDescendantPids(rootPid);
    // Kill children in reverse order (bottom-up) first
    for (let i = descendants.length - 1; i >= 0; i--) {
      await killProcess(descendants[i]);
    }
    // Kill the root process
    await killProcess(rootPid);
  } catch (err) {
    console.error(`Failed to kill process tree for PID ${rootPid}:`, err);
  }
}

