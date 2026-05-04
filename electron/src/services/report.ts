import { tasks } from "../store/index.js";

type TaskTiming = {
  startTime: Date;
  endTime: Date;
};

export class ExecutionReport {
  public status: "success" | "failure" | "running" | "stopped" | "pending" = "pending";
  public timing = new Map<string, TaskTiming>();
  public totalDuration = 0;
  public taskSuccessCount = 0;
  public taskFailureCount = 0;
  public parallelEfficiency = 0;

  updateStatus() {
    let hasFailure = false;
    let hasRunning = false;

    for (const task of tasks) {
      if (task.state === "failed" || task.state === "stopped") {
        hasFailure = true;
      }
      if (task.state === "running" || task.state === "starting") {
        hasRunning = true;
      }
    }

    if (hasFailure) this.status = "failure";
    else if (hasRunning) this.status = "running";
    else this.status = "success";
  }

  recordTiming(taskId: string, start: Date, end: Date) {
    this.timing.set(taskId, { startTime: start, endTime: end });
  }

  calculateMetrics() {
    this.calculateTaskCounts();
    this.totalDuration = this.calculateMakespan();
    this.parallelEfficiency = this.calculateParallelEfficiency();
  }

  private calculateTaskCounts() {
    this.taskSuccessCount = 0;
    this.taskFailureCount = 0;
    for (const task of tasks) {
      if (task.state === "completed" || task.state === "ready") {
        this.taskSuccessCount++;
      } else if (task.state === "failed" || task.state === "stopped") {
        this.taskFailureCount++;
      }
    }
  }

  private calculateWork(): number {
    let work = 0;
    for (const timing of this.timing.values()) {
      work += (timing.endTime.getTime() - timing.startTime.getTime()) / 1000;
    }
    return work;
  }

  private calculateMakespan(): number {
    if (this.timing.size === 0) return 0;

    let minStart = Infinity;
    let maxEnd = -Infinity;

    for (const timing of this.timing.values()) {
      minStart = Math.min(minStart, timing.startTime.getTime());
      maxEnd = Math.max(maxEnd, timing.endTime.getTime());
    }

    return (maxEnd - minStart) / 1000;
  }

  private calculateParallelEfficiency(): number {
    const work = this.calculateWork();
    const makespan = this.calculateMakespan();
    const n = this.timing.size;

    if (makespan === 0 || n === 0) return 0;

    const parallelism = work / makespan;
    return (parallelism / n) * 100;
  }

  getAverageLatency(): number {
    if (this.timing.size === 0) return 0;
    const work = this.calculateWork();
    return work / this.timing.size;
  }
}
