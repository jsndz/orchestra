import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export type PortInfo = {
  inUse: boolean;
  pid?: number;
  command?: string;
};

/**
 * Checks whether a TCP port is in use and returns the owning PID and command.
 */
export async function checkPort(port: number): Promise<PortInfo> {
  try {
    if (process.platform === "win32") {
      // Get the owning PID
      const { stdout: pidOut } = await execPromise(
        `powershell -NoProfile -Command "(Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess"`
      );

      const pid = Number(pidOut.trim());

      if (!pid || Number.isNaN(pid)) {
        return { inUse: false };
      }

      // Get the process name
      let command = "Unknown";
      try {
        const { stdout: cmdOut } = await execPromise(
          `powershell -NoProfile -Command "(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).ProcessName"`
        );

        if (cmdOut.trim()) {
          command = cmdOut.trim();
        }
      } catch {}

      return {
        inUse: true,
        pid,
        command,
      };
    }

    // Linux/macOS
    const { stdout } = await execPromise(
      `lsof -iTCP:${port} -sTCP:LISTEN -Fpc`
    );

    let pid: number | undefined;
    let command: string | undefined;

    for (const line of stdout.split("\n")) {
      if (line.startsWith("p")) {
        pid = Number(line.slice(1));
      } else if (line.startsWith("c")) {
        command = line.slice(1);
      }
    }

    if (!pid) {
      return { inUse: false };
    }

    return {
      inUse: true,
      pid,
      command: command ?? "Unknown",
    };
  } catch {
    return { inUse: false };
  }
}

/**
 * Kills a single process.
 */
export async function killProcess(pid: number): Promise<void> {
  try {
    if (process.platform === "win32") {
      await execPromise(`taskkill /PID ${pid} /F`);
    } else {
      process.kill(pid, "SIGKILL");
    }
  } catch (err: any) {
    if (
      err.code === "ESRCH" ||
      err.message?.includes("No such process") ||
      err.message?.includes("not found")
    ) {
      return;
    }

    throw err;
  }
}

/**
 * Returns all descendants of a process.
 * Windows returns an empty array because taskkill /T handles this.
 */
async function getDescendantPids(rootPid: number): Promise<number[]> {
  if (process.platform === "win32") {
    return [];
  }

  const parentMap = new Map<number, number>();
  const descendants: number[] = [];

  const { stdout } = await execPromise("ps -eo pid=,ppid=");

  for (const line of stdout.split("\n")) {
    const [pidStr, ppidStr] = line.trim().split(/\s+/);

    const pid = Number(pidStr);
    const ppid = Number(ppidStr);

    if (!Number.isNaN(pid) && !Number.isNaN(ppid)) {
      parentMap.set(pid, ppid);
    }
  }

  const queue = [rootPid];
  const visited = new Set<number>();

  while (queue.length) {
    const current = queue.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    for (const [pid, ppid] of parentMap.entries()) {
      if (ppid === current) {
        descendants.push(pid);
        queue.push(pid);
      }
    }
  }

  return descendants;
}

/**
 * Kills a process and its children.
 */
export async function killProcessTree(rootPid: number): Promise<void> {
  try {
    if (process.platform === "win32") {
      // Windows handles the entire tree natively.
      await execPromise(`taskkill /PID ${rootPid} /T /F`);
      return;
    }

    const descendants = await getDescendantPids(rootPid);

    // Kill deepest children first.
    for (let i = descendants.length - 1; i >= 0; i--) {
      await killProcess(descendants[i]);
    }

    await killProcess(rootPid);
  } catch (err: any) {
    if (
      err.message?.includes("No such process") ||
      err.message?.includes("not found")
    ) {
      return;
    }

    throw err;
  }
}