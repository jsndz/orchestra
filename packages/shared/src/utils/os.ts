import os from "os";

export function getStaticStats() {
  const cpus = os.cpus();
  return {
    cpuModel: cpus[0]?.model ?? "Unknown",
    cpuCores: cpus.length,
    totalMem: os.totalmem(),
    platform: os.platform(),
  };
}

export function getDynamicStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  return {
    loadAvg: os.loadavg(),
    freeMem,
    usedMem,
    uptime: os.uptime(),
  };
}

export function getSystemStats() {
  return {
    ...getStaticStats(),
    ...getDynamicStats(),
  };
}

function getCPUTicks() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((core) => {
    for (const type in core.times) {
      totalTick += core.times[type as keyof typeof core.times];
    }
    totalIdle += core.times.idle;
  });

  return { idle: totalIdle, total: totalTick };
}

let lastSample = getCPUTicks();

export function getLiveCpuPercentage(): number {
  const currentSample = getCPUTicks();

  const idleDifference = currentSample.idle - lastSample.idle;
  const totalDifference = currentSample.total - lastSample.total;

  lastSample = currentSample;

  if (totalDifference === 0) return 0;

  const percentage = 100 - (100 * idleDifference) / totalDifference;
  return parseFloat(percentage.toFixed(1));
}
export function streamStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPer = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
  return {
    freemem: freeMem,
    usedmem: usedMem,
    memoryper: memPer,
    uptime: os.uptime(),
    loadavg: os.loadavg,
    cpuper: getLiveCpuPercentage(),
  };
}
