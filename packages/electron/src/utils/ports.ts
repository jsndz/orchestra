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
    // If native kill fails, try system commands
    const platform = process.platform;
    if (platform === "win32") {
      await execPromise(`taskkill /F /PID ${pid}`);
    } else {
      await execPromise(`kill -9 ${pid}`);
    }
  }
}
