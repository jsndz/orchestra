import { exec } from "child_process";
import os from "os";

export interface ProcessStats {
  cpu: number;    // %
  memory: number; // MB
}

// Unix-like process list retrieval (macOS and Linux)
function getUnixStats(): Promise<Map<number, { ppid: number; cpu: number; mem: number }>> {
  return new Promise((resolve) => {
    exec("ps -o pid=,ppid=,pcpu=,rss=", (err, stdout) => {
      const map = new Map<number, { ppid: number; cpu: number; mem: number }>();
      if (err || !stdout) return resolve(map);
      
      const lines = stdout.split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          const pid = parseInt(parts[0], 10);
          const ppid = parseInt(parts[1], 10);
          const cpu = parseFloat(parts[2]);
          const mem = parseFloat(parts[3]) / 1024; // KB to MB
          if (!isNaN(pid) && !isNaN(ppid)) {
            map.set(pid, { ppid, cpu, mem });
          }
        }
      }
      resolve(map);
    });
  });
}

// Windows process list retrieval
function getWindowsStats(): Promise<Map<number, { ppid: number; cpu: number; mem: number }>> {
  return new Promise((resolve) => {
    // ProcessId, ParentProcessId, WorkingSetSize (WorkingSetSize is in bytes)
    exec("wmic process get ProcessId,ParentProcessId,WorkingSetSize", (err, stdout) => {
      const map = new Map<number, { ppid: number; cpu: number; mem: number }>();
      if (err || !stdout) return resolve(map);

      const lines = stdout.split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const ppid = parseInt(parts[0], 10);
          const pid = parseInt(parts[1], 10);
          const ws = parseInt(parts[2], 10);
          if (!isNaN(pid) && !isNaN(ppid)) {
            const mem = !isNaN(ws) ? ws / (1024 * 1024) : 0; // Bytes to MB
            map.set(pid, { ppid, cpu: 0, mem });
          }
        }
      }

      // Query approximate CPU usage values from Get-Process on Windows
      exec("powershell -Command \"Get-Process | Select-Object Id, CPU\"", (err2, stdout2) => {
        if (!err2 && stdout2) {
          const lines2 = stdout2.split("\n");
          for (const line2 of lines2) {
            const parts2 = line2.trim().split(/\s+/);
            if (parts2.length >= 2) {
              const pid = parseInt(parts2[0], 10);
              const cpu = parseFloat(parts2[1]);
              if (!isNaN(pid) && map.has(pid)) {
                const entry = map.get(pid)!;
                // Approximate dynamic load delta proxy
                entry.cpu = !isNaN(cpu) ? parseFloat((cpu * 0.05).toFixed(1)) : 0;
              }
            }
          }
        }
        resolve(map);
      });
    });
  });
}

/**
 * Traverses the process tree recursively starting from rootPid and sums up CPU & Memory usage.
 */
export async function getProcessTreeStats(rootPid: number): Promise<ProcessStats> {
  if (!rootPid || rootPid <= 0) {
    return { cpu: 0, memory: 0 };
  }

  const isWindows = os.platform() === "win32";
  const processMap = isWindows ? await getWindowsStats() : await getUnixStats();

  let totalCpu = 0;
  let totalMem = 0;

  const queue = [rootPid];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const stats = processMap.get(current);
    if (stats) {
      totalCpu += stats.cpu;
      totalMem += stats.mem;
    }

    for (const [pid, info] of processMap.entries()) {
      if (info.ppid === current) {
        queue.push(pid);
      }
    }
  }

  return {
    cpu: parseFloat(totalCpu.toFixed(1)),
    memory: parseFloat(totalMem.toFixed(1))
  };
}
