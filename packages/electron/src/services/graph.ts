import { Dependency, Task } from "../types/index.js";
import { Queue } from "../utils/queue.js";

type AdjacencyList = number[][];

/**
 * Builds an adjacency list from dependencies and tasks.
 */
function buildAdjacencyList(
  dependencies: Dependency[],
  tasks: Task[],
  idToIndex: Map<string, number>,
): AdjacencyList {
  const al: AdjacencyList = Array.from({ length: tasks.length }, () => []);
  for (const dep of dependencies) {
    const fromIdx = idToIndex.get(dep.from);
    const toIdx = idToIndex.get(dep.to);
    if (fromIdx !== undefined && toIdx !== undefined) {
      al[fromIdx].push(toIdx);
    }
  }
  return al;
}

function getIdToIndexMap(tasks: Task[]): Map<string, number> {
  const map = new Map<string, number>();
  tasks.forEach((t, i) => map.set(t.id, i));
  return map;
}

export function resolveDependencies(dependencies: Dependency[], tasks: Task[]) {
  const idToIndex = getIdToIndexMap(tasks);
  const al = buildAdjacencyList(dependencies, tasks, idToIndex);
  const inDegree = Array(al.length).fill(0);

  for (const neighbors of al) {
    for (const v of neighbors) inDegree[v]++;
  }

  const q = new Queue<number>();
  inDegree.forEach((degree, i) => {
    if (degree === 0) q.push(i);
  });

  const order: string[] = [];
  while (!q.isEmpty()) {
    const u = q.pop()!;
    order.push(tasks[u].task);
    for (const v of al[u]) {
      if (--inDegree[v] === 0) q.push(v);
    }
  }

  if (order.length === tasks.length) {
    return { ok: true, order };
  }

  const cycleIdx = detectCycle(dependencies, tasks);
  const cycle = cycleIdx.map((i) => tasks[i].task);
  return { ok: false, cycle };
}

export function shortestPath(
  dependencies: Dependency[],
  tasks: Task[],
  fromId: string,
  toId: string,
) {
  const idToIndex = getIdToIndexMap(tasks);
  const src = idToIndex.get(fromId);
  const dst = idToIndex.get(toId);

  if (src === undefined || dst === undefined) return [];

  const al = buildAdjacencyList(dependencies, tasks, idToIndex);
  const q = new Queue<number>();
  const parent = Array(al.length).fill(-1);
  const visited = Array(al.length).fill(false);

  q.push(src);
  visited[src] = true;

  while (!q.isEmpty()) {
    const u = q.pop()!;
    if (u === dst) break;
    for (const v of al[u]) {
      if (!visited[v]) {
        visited[v] = true;
        parent[v] = u;
        q.push(v);
      }
    }
  }

  if (!visited[dst]) return [];

  const path: string[] = [];
  for (let i = dst; i !== -1; i = parent[i]) {
    path.push(tasks[i].task);
  }
  return path.reverse();
}

function runDFS(
  node: number,
  al: AdjacencyList,
  visited: number[],
  parent: number[],
  cycle: number[],
): boolean {
  visited[node] = 1; // 1 = visiting

  for (const neighbor of al[node]) {
    if (visited[neighbor] === 0) {
      parent[neighbor] = node;
      if (runDFS(neighbor, al, visited, parent, cycle)) return true;
    } else if (visited[neighbor] === 1) {
      // Cycle detected
      cycle.push(neighbor);
      let curr = node;
      while (curr !== neighbor && curr !== -1) {
        cycle.push(curr);
        curr = parent[curr];
      }
      cycle.push(neighbor);
      cycle.reverse();
      return true;
    }
  }

  visited[node] = 2; // 2 = visited
  return false;
}

export function detectCycle(dependencies: Dependency[], tasks: Task[]): number[] {
  const n = tasks.length;
  const parent = Array(n).fill(-1);
  const visited = Array(n).fill(0);
  const cycle: number[] = [];
  const idToIndex = getIdToIndexMap(tasks);
  const al = buildAdjacencyList(dependencies, tasks, idToIndex);

  for (let i = 0; i < n; i++) {
    if (visited[i] === 0) {
      if (runDFS(i, al, visited, parent, cycle)) break;
    }
  }
  return cycle;
}

export function parallelExecution(dependencies: Dependency[], tasks: Task[]) {
  const idToIndex = getIdToIndexMap(tasks);
  const al = buildAdjacencyList(dependencies, tasks, idToIndex);
  const inDegree = Array(al.length).fill(0);

  for (const neighbors of al) {
    for (const v of neighbors) inDegree[v]++;
  }

  const q = new Queue<number>();
  inDegree.forEach((degree, i) => {
    if (degree === 0) q.push(i);
  });

  let processedCount = 0;
  const levels: Task[][] = [];

  while (!q.isEmpty()) {
    const level: Task[] = [];
    const size = q.size;

    for (let i = 0; i < size; i++) {
      const u = q.pop()!;
      processedCount++;
      level.push(tasks[u]);

      for (const v of al[u]) {
        if (--inDegree[v] === 0) q.push(v);
      }
    }
    levels.push(level);
  }

  if (processedCount !== tasks.length) {
    return { ok: false };
  }

  return { ok: true, levels };
}

export function terminalNodes(dependencies: Dependency[], tasks: Task[]): number[] {
  const idToIndex = getIdToIndexMap(tasks);
  const al = buildAdjacencyList(dependencies, tasks, idToIndex);
  const terminals: number[] = [];

  al.forEach((edges, i) => {
    if (edges.length === 0) terminals.push(i);
  });

  return terminals;
}

export function unreachableNodes(dependencies: Dependency[], tasks: Task[]): number[] {
  const idToIndex = getIdToIndexMap(tasks);
  const al = buildAdjacencyList(dependencies, tasks, idToIndex);
  const inDegree = Array(al.length).fill(0);

  for (const neighbors of al) {
    for (const v of neighbors) inDegree[v]++;
  }

  const q = new Queue<number>();
  const visited = Array(al.length).fill(false);

  inDegree.forEach((degree, i) => {
    if (degree === 0) q.push(i);
  });

  while (!q.isEmpty()) {
    const u = q.pop()!;
    visited[u] = true;
    for (const v of al[u]) {
      if (!visited[v]) q.push(v);
    }
  }

  const unreachable: number[] = [];
  visited.forEach((v, i) => {
    if (!v) unreachable.push(i);
  });

  return unreachable;
}
