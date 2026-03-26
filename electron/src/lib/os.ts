import os from "os";

export function getSystemStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const cpus = os.cpus();

  return {
    cpuModel: cpus[0]?.model,
    cpuCores: cpus.length,
    loadAvg: os.loadavg(),
    totalMem,
    freeMem,
    usedMem,
    uptime: os.uptime(),
    platform: os.platform(),
  };
}