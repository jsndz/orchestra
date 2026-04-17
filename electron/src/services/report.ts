import { tasks } from "../store/index.js";

type TaskTiming = {
  startTime: Date;
  endTime: Date;
};

class Report {
  status: "success" | "failure" | "running" | "stopped" | "pending";
  timing: Map<string, TaskTiming>;
  totalDuration: number;
  taskSuccessCount: number;
  taskFailureCount: number;
  parallelEfficiency: number;
  constructor() {
    this.status = "pending";
    this.timing = new Map<string, TaskTiming>();
    this.totalDuration = 0;
    this.taskSuccessCount = 0;
    this.taskFailureCount = 0;
    this.parallelEfficiency = 0;
  }

  CalculateStatus() {
    // logic to calculate status based on tasks
    for (const task of tasks) {
      if (task.state == "failed" || task.state == "stopped") {
        this.status = "failure";
      }
    }
    this.status = "success";
  }
  updateTiming(taskId: string, start: Date, end: Date) {
    this.timing.set(taskId, { startTime: start, endTime: end });
  }

  calculateTotalTime() {
    if (this.totalDuration !== 0) return this.totalDuration;
    for (const [_, timing] of this.timing.entries()) {
      const duration =
        (timing.endTime.getTime() - timing.startTime.getTime()) / 1000;
      this.totalDuration += duration;
    }
  }
  calculateTaskCounts() {
    for (const task of tasks) {
      if (task.state === "completed" || task.state === "ready") {
        this.taskSuccessCount += 1;
      } else if (task.state === "failed" || task.state === "stopped") {
        this.taskFailureCount += 1;
      }
    }
  }
  calculateWork(): number {
    let work = 0;
    for (const [, t] of this.timing) {
      work += (t.endTime.getTime() - t.startTime.getTime()) / 1000;
    }
    return work;
  }

  calculateMakespan(): number {
    if (this.timing.size === 0) return 0;

    let minStart = Infinity;
    let maxEnd = -Infinity;

    for (const [, t] of this.timing) {
      const s = t.startTime.getTime();
      const e = t.endTime.getTime();
      if (s < minStart) minStart = s;
      if (e > maxEnd) maxEnd = e;
    }

    return (maxEnd - minStart) / 1000;
  }

  calculateParallelEfficiency(): number {
    const work = this.calculateWork();
    const makespan = this.calculateMakespan();
    const N = this.timing.size;

    if (makespan === 0 || N === 0) return 0;

    const parallelism = work / makespan;
    const efficiency = parallelism / N;

    return efficiency * 100;
  }
  getDurations(): number[] {
    const durations: number[] = [];

    for (const [, t] of this.timing) {
      durations.push((t.endTime.getTime() - t.startTime.getTime()) / 1000);
    }

    return durations;
  }
  getAverageLatency(): number {
    const d = this.getDurations();
    if (d.length === 0) return 0;

    return d.reduce((a, b) => a + b, 0) / d.length;
  }
}
