import { Dependency, Task } from "../types/index.js";
import { Queue } from "./queue.js";

export type AdjacencyList = Map<string, string[]>;

/**
 * Builds an adjacency list from dependencies and tasks.
 */
export function buildAdjacencyList(
  dependencies: Dependency[],
  tasks: Task[],
): AdjacencyList {
  const al: AdjacencyList = new Map();
  for (const task of tasks) {
    al.set(task.id, []);
  }
  for (const dep of dependencies) {
    if (al.has(dep.from) && al.has(dep.to)) {
      al.get(dep.from)!.push(dep.to);
    }
  }
  return al;
}

export function buildIndegreeMap(
  adjacencyList: AdjacencyList,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const taskId of adjacencyList.keys()) {
    map.set(taskId, 0);
  }
  for (const neighbours of adjacencyList.values()) {
    for (const neighbour of neighbours) {
      map.set(neighbour, (map.get(neighbour) ?? 0) + 1);
    }
  }
  return map;
}

export function resolveDependencies(dependencies: Dependency[], tasks: Task[]) {
  const al = buildAdjacencyList(dependencies, tasks);
  const inDegree = buildIndegreeMap(al);

  const q = new Queue<string>();
  for (const [taskId, degree] of inDegree.entries()) {
    if (degree === 0) q.push(taskId);
  }

  const taskMap = new Map<string, Task>(tasks.map((t) => [t.id, t]));
  const order: string[] = [];
  while (!q.isEmpty()) {
    const u = q.pop()!;
    const task = taskMap.get(u);
    if (task) {
      order.push(task.task);
    }
    const neighbors = al.get(u) || [];
    for (const v of neighbors) {
      const newDegree = (inDegree.get(v) || 0) - 1;
      inDegree.set(v, newDegree);
      if (newDegree === 0) q.push(v);
    }
  }

  if (order.length === tasks.length) {
    return { ok: true, order };
  }

  const cycleIds = detectCycle(dependencies, tasks);
  const cycle = cycleIds.map((id) => taskMap.get(id)?.task || "");
  return { ok: false, cycle };
}

export function buildTaskMap(tasks: Task[]) {
  const map = new Map<string, Task>();
  for (const task of tasks) {
    map.set(task.id, task);
  }
  return map;
}

export function shortestPath(
  dependencies: Dependency[],
  tasks: Task[],
  fromId: string,
  toId: string,
) {
  const taskMap = new Map<string, Task>(tasks.map((t) => [t.id, t]));
  if (!taskMap.has(fromId) || !taskMap.has(toId)) return [];

  const al = buildAdjacencyList(dependencies, tasks);
  const q = new Queue<string>();
  const parent = new Map<string, string>();
  const visited = new Set<string>();

  q.push(fromId);
  visited.add(fromId);

  while (!q.isEmpty()) {
    const u = q.pop()!;
    if (u === toId) break;
    const neighbors = al.get(u) || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        parent.set(v, u);
        q.push(v);
      }
    }
  }

  if (!visited.has(toId)) return [];

  const path: string[] = [];
  let curr: string | undefined = toId;
  while (curr !== undefined) {
    const t = taskMap.get(curr);
    if (t) {
      path.push(t.task);
    }
    curr = parent.get(curr);
  }
  return path.reverse();
}

function runDFS(
  node: string,
  al: AdjacencyList,
  visited: Map<string, number>,
  parent: Map<string, string>,
  cycle: string[],
): boolean {
  visited.set(node, 1); // 1 = visiting

  const neighbors = al.get(node) || [];
  for (const neighbor of neighbors) {
    const state = visited.get(neighbor) || 0;
    if (state === 0) {
      parent.set(neighbor, node);
      if (runDFS(neighbor, al, visited, parent, cycle)) return true;
    } else if (state === 1) {
      // Cycle detected
      cycle.push(neighbor);
      let curr: string | undefined = node;
      while (curr !== neighbor && curr !== undefined && curr !== "") {
        cycle.push(curr);
        curr = parent.get(curr);
      }
      cycle.push(neighbor);
      cycle.reverse();
      return true;
    }
  }

  visited.set(node, 2); // 2 = visited
  return false;
}

export function detectCycle(
  dependencies: Dependency[],
  tasks: Task[],
): string[] {
  const parent = new Map<string, string>();
  const visited = new Map<string, number>();
  const cycle: string[] = [];
  const al = buildAdjacencyList(dependencies, tasks);

  for (const task of tasks) {
    if ((visited.get(task.id) || 0) === 0) {
      if (runDFS(task.id, al, visited, parent, cycle)) break;
    }
  }
  return cycle;
}

export function parallelExecution(dependencies: Dependency[], tasks: Task[]) {
  const al = buildAdjacencyList(dependencies, tasks);
  const inDegree = buildIndegreeMap(al);

  const q = new Queue<string>();
  for (const [taskId, degree] of inDegree.entries()) {
    if (degree === 0) q.push(taskId);
  }

  const taskMap = new Map<string, Task>(tasks.map((t) => [t.id, t]));
  let processedCount = 0;
  const levels: Task[][] = [];

  while (!q.isEmpty()) {
    const level: Task[] = [];
    const size = q.size;

    for (let i = 0; i < size; i++) {
      const u = q.pop()!;
      processedCount++;
      const task = taskMap.get(u);
      if (task) {
        level.push(task);
      }

      const neighbors = al.get(u) || [];
      for (const v of neighbors) {
        const newDegree = (inDegree.get(v) || 0) - 1;
        inDegree.set(v, newDegree);
        if (newDegree === 0) q.push(v);
      }
    }
    levels.push(level);
  }

  if (processedCount !== tasks.length) {
    return { ok: false };
  }

  return { ok: true, levels };
}

export function terminalNodes(
  dependencies: Dependency[],
  tasks: Task[],
): string[] {
  const al = buildAdjacencyList(dependencies, tasks);
  const terminals: string[] = [];

  for (const [taskId, edges] of al.entries()) {
    if (edges.length === 0) terminals.push(taskId);
  }

  return terminals;
}

export function unreachableNodes(
  dependencies: Dependency[],
  tasks: Task[],
): string[] {
  const al = buildAdjacencyList(dependencies, tasks);
  const inDegree = buildIndegreeMap(al);

  const q = new Queue<string>();
  const visited = new Set<string>();

  for (const [taskId, degree] of inDegree.entries()) {
    if (degree === 0) q.push(taskId);
  }

  while (!q.isEmpty()) {
    const u = q.pop()!;
    visited.add(u);
    const neighbors = al.get(u) || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        q.push(v);
      }
    }
  }

  const unreachable: string[] = [];
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      unreachable.push(task.id);
    }
  }

  return unreachable;
}
