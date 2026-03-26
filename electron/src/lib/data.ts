import { tasks, dependencies } from "../store";
import type { Task } from "../store";

export function addMockData() {
  const task1: Task = {
    id: crypto.randomUUID(),
    task: "install frontend",
    folder: "/home/jaison/code/projects/twitter/client",
    command: "npm i",
    dependency: [],
    type: "job",
    state: "idle",
  };

  const task2: Task = {
    id: crypto.randomUUID(),
    task: "run frontend",
    folder: "/home/jaison/code/projects/twitter/client",
    command: "npm run dev",
    dependency: [],
    type: "service",
    state: "idle",
    ready: { kind: "port", port: 3000 },
  };

  const task3: Task = {
    id: crypto.randomUUID(),
    task: "install backend",
    folder: "/home/jaison/code/projects/twitter/server",
    command: "npm i",
    dependency: [],
    type: "job",
    state: "idle",
  };

  const task4: Task = {
    id: crypto.randomUUID(),
    task: "start mongodb",
    folder: "/home/jaison/code/projects/twitter/server",
    command: "docker start mongodb",
    dependency: [],
    type: "service",
    state: "idle",
    ready: { kind: "port", port: 27017 },
  };

  const task6: Task = {
    id: crypto.randomUUID(),
    task: "run backend",
    folder: "/home/jaison/code/projects/twitter/server",
    command: "npm start",
    dependency: [],
    type: "service",
    state: "idle",
    ready: { kind: "log", match: /listening|server started/i },
  };

  const task5: Task = {
    id: crypto.randomUUID(),
    task: "backend tests",
    folder: "/home/jaison/code/projects/twitter/server",
    command: "npm test",
    dependency: [],
    type: "job",
    state: "idle",
  };

  const all = [task1, task2, task3, task4, task5, task6];
  tasks.push(...all);

  const deps = [
    { from: task1.id, to: task2.id },
    { from: task3.id, to: task6.id },
    { from: task6.id, to: task5.id },
  ];

  for (const { from, to } of deps) { 
    const child = all.find(t => t.id === to)!;
    child.dependency.push(from);
  }

  dependencies.push(...deps);
}