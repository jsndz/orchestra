import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { workflowStore } from "../../store/index.js";
import {
  detectCycle,
  parallelExecution,
  resolveDependencies,
  shortestPath,
  terminalNodes,
  unreachableNodes,
} from "../../utils/graph.js";

/**
 * Registers graph analysis and DAG validation tools with the MCP server.
 */
export function registerGraphTools(mcp: McpServer) {
  // Get DAG topological execution order
  mcp.registerTool(
    "get_graph_order",
    {
      description: "Calculate the topological execution order of the workflow DAG",
    },
    async () => {
      try {
        const tasks = workflowStore.getTasks();
        const deps = workflowStore.getDependencies();
        const result = resolveDependencies(deps, tasks);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to calculate graph order: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Detect circular dependencies (cycles)
  mcp.registerTool(
    "detect_graph_cycle",
    {
      description: "Detect if there are circular dependency cycles in the workflow graph",
    },
    async () => {
      try {
        const tasks = workflowStore.getTasks();
        const deps = workflowStore.getDependencies();
        const cycleIds = detectCycle(deps, tasks);
        const taskMap = new Map(tasks.map((t) => [t.id, t.task]));
        const cycleNames = cycleIds.map((id) => taskMap.get(id) || id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  hasCycle: cycleIds.length > 0,
                  cycleNodeIds: cycleIds,
                  cycleTaskNames: cycleNames,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to detect graph cycles: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Analyze parallel execution levels
  mcp.registerTool(
    "get_parallel_execution",
    {
      description: "Analyze which tasks can be executed concurrently in parallel levels",
    },
    async () => {
      try {
        const tasks = workflowStore.getTasks();
        const deps = workflowStore.getDependencies();
        const result = parallelExecution(deps, tasks);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to calculate parallel execution levels: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Find shortest dependency path between two task nodes
  mcp.registerTool(
    "get_shortest_path",
    {
      description: "Find the shortest dependency path between a source task and target task",
      inputSchema: z.object({
        from: z.string().describe("Source task ID"),
        to: z.string().describe("Target task ID"),
      }),
    },
    async ({ from, to }) => {
      try {
        const tasks = workflowStore.getTasks();
        const deps = workflowStore.getDependencies();
        const result = shortestPath(deps, tasks, from, to);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to find shortest path from ${from} to ${to}: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Find terminal nodes
  mcp.registerTool(
    "get_terminal_nodes",
    {
      description: "Find terminal nodes (tasks with no downstream dependents)",
    },
    async () => {
      try {
        const tasks = workflowStore.getTasks();
        const deps = workflowStore.getDependencies();
        const terminalIds = terminalNodes(deps, tasks);
        const taskMap = new Map(tasks.map((t) => [t.id, t.task]));
        const names = terminalIds.map((id) => taskMap.get(id) || id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ terminalIds, terminalTaskNames: names }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to find terminal nodes: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Find unreachable nodes
  mcp.registerTool(
    "get_unreachable_nodes",
    {
      description: "Find unreachable task nodes in the workflow graph",
    },
    async () => {
      try {
        const tasks = workflowStore.getTasks();
        const deps = workflowStore.getDependencies();
        const unreachableIds = unreachableNodes(deps, tasks);
        const taskMap = new Map(tasks.map((t) => [t.id, t.task]));
        const names = unreachableIds.map((id) => taskMap.get(id) || id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ unreachableIds, unreachableTaskNames: names }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to find unreachable nodes: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}

