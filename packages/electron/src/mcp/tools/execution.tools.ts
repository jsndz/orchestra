import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import stripAnsi from "strip-ansi";
import { workflowStore } from "../../store/index.js";
import { workflowRunner } from "../../services/execution/runner.js";
import { executeWorkflow } from "../../services/execution/index.js";

/**
 * Registers workflow execution control tools with the MCP server.
 */
export function registerExecutionTools(mcp: McpServer) {
  // Get execution state
  mcp.registerTool(
    "get_execution_state",
    {
      description: "Get the current global execution state and status of all tasks",
    },
    async () => {
      const globalState = workflowStore.getGlobalState();
      const tasks = workflowStore.getTasks().map((t) => ({
        id: t.id,
        task: t.task,
        state: t.state,
        failureReason: t.failureReason,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ globalState, tasks }, null, 2),
          },
        ],
      };
    }
  );

  // Get task output logs
  mcp.registerTool(
    "get_task_logs",
    {
      description: "Retrieve recent terminal output log lines for a specific task node",
      inputSchema: z.object({
        id: z.string().describe("Task ID or task name to fetch logs for"),
        lines: z.number().optional().default(50).describe("Number of recent lines to retrieve"),
      }),
    },
    async ({ id, lines }) => {
      const tasks = workflowStore.getTasks();
      const task = tasks.find((t) => t.id === id || t.task.toLowerCase() === id.toLowerCase());

      if (!task) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Task '${id}' not found.`,
            },
          ],
        };
      }

      const taskLogger = workflowRunner.getTaskLogger();
      const rawLogs = taskLogger.getTaskLogs(task, lines);
      const cleanLogs = stripAnsi(rawLogs);

      return {
        content: [
          {
            type: "text",
            text: cleanLogs || "(No logs available for this task)",
          },
        ],
      };
    }
  );

  // Start workflow execution
  mcp.registerTool(
    "start_workflow",
    {
      description: "Start executing the active workflow tasks in DAG order",
    },
    async () => {
      try {
        const result = await executeWorkflow();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, result }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to start workflow execution: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Stop entire workflow
  mcp.registerTool(
    "stop_workflow",
    {
      description: "Stop all currently running workflow tasks",
    },
    async () => {
      try {
        await workflowRunner.stopAllTasks();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, message: "All tasks stopped" }),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to stop workflow: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Stop a single task by ID
  mcp.registerTool(
    "stop_task",
    {
      description: "Stop a specific running task by ID",
      inputSchema: z.object({
        id: z.string().describe("Task ID to stop"),
      }),
    },
    async ({ id }) => {
      try {
        await workflowRunner.stopTask(id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, stoppedId: id }),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to stop task ${id}: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
