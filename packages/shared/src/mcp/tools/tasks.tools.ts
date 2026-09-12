import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { workflowStore } from "../../store/index.js";

/**
 * Registers task and dependency management tools with the MCP server.
 */
export function registerTaskTools(mcp: McpServer) {
  // Query active workflow (tasks + dependencies)
  mcp.registerTool(
    "get_workflow",
    {
      description: "Get the current workflow state including all tasks and dependencies",
    },
    async () => {
      try {
        const workflow = workflowStore.getWorkflow();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(workflow, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to retrieve workflow: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Create a new task
  mcp.registerTool(
    "create_task",
    {
      description: "Create a new task in the active workflow",
      inputSchema: z.object({
        task: z.string().describe("Task name or label"),
        command: z.string().describe("Command line string to execute"),
        folder: z.string().describe("Working directory path for the task"),
        type: z
          .enum(["job", "service"])
          .default("job")
          .describe("Task type (task, service, or process)"),
        timeout: z.number().int().nonnegative().optional().describe("Timeout in seconds"),
        retries: z.number().int().nonnegative().optional().describe("Number of retry attempts"),
        env: z.record(z.string(), z.string()).optional().describe("Environment variables map"),
        readyKind: z.enum(["exit", "port", "log", "http"]).optional().default("exit").describe("How Orchestra detects task readiness"),
        readyPort: z.number().int().min(1).max(65535).optional().describe("Port number if readyKind is 'port'"),
        readyLogMatch: z.string().optional().describe("Log message to match if readyKind is 'log'"),
        readyHttpUrl: z.string().optional().describe("HTTP URL to poll if readyKind is 'http'"),
        onwatch: z.boolean().optional().default(false).describe("Whether to auto-restart task on file changes"),
      }),
    },
    async ({ task, command, folder, type, timeout, retries, env, readyKind, readyPort, readyLogMatch, readyHttpUrl, onwatch }) => {
      try {
        let readyObj: any = { kind: readyKind || "exit" };
        if (readyKind === "port" && readyPort) {
          readyObj = { kind: "port", port: readyPort };
        } else if (readyKind === "log" && readyLogMatch) {
          readyObj = { kind: "log", match: readyLogMatch, isRegex: false };
        } else if (readyKind === "http" && readyHttpUrl) {
          readyObj = { kind: "http", url: readyHttpUrl, code: 200 };
        }

        const created = workflowStore.createTask({
          task,
          command,
          folder,
          type,
          timeout: timeout ?? 0,
          retries: retries ?? 0,
          env: env ?? {},
          ready: readyObj,
          onwatch: onwatch ?? false,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, task: created }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to create task: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Update an existing task
  mcp.registerTool(
    "update_task",
    {
      description: "Update properties of an existing task by ID",
      inputSchema: z.object({
        id: z.string().describe("Target task ID"),
        task: z.string().optional().describe("Updated task name"),
        command: z.string().optional().describe("Updated command string"),
        folder: z.string().optional().describe("Updated working directory path"),
        type: z
          .enum(["job", "service"])
          .optional()
          .describe("Updated task type"),
        timeout: z.number().int().nonnegative().optional().describe("Updated timeout in seconds"),
        retries: z.number().int().nonnegative().optional().describe("Updated retry count"),
        env: z.record(z.string(), z.string()).optional().describe("Updated environment variables"),
        readyKind: z.enum(["exit", "port", "log", "http"]).optional().describe("Updated readiness check type"),
        readyPort: z.number().int().min(1).max(65535).optional().describe("Updated port number for ready check"),
        readyLogMatch: z.string().optional().describe("Updated log match text for ready check"),
        readyHttpUrl: z.string().optional().describe("Updated HTTP URL for ready check"),
        onwatch: z.boolean().optional().describe("Updated auto-restart file watch setting"),
      }),
    },
    async ({ id, readyKind, readyPort, readyLogMatch, readyHttpUrl, ...updates }) => {
      try {
        const updatePayload: Record<string, any> = { ...updates };
        if (readyKind) {
          let readyObj: any = { kind: readyKind };
          if (readyKind === "port" && readyPort) {
            readyObj = { kind: "port", port: readyPort };
          } else if (readyKind === "log" && readyLogMatch) {
            readyObj = { kind: "log", match: readyLogMatch, isRegex: false };
          } else if (readyKind === "http" && readyHttpUrl) {
            readyObj = { kind: "http", url: readyHttpUrl, code: 200 };
          }
          updatePayload.ready = readyObj;
        }

        const updated = workflowStore.updateTask(id, updatePayload);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, task: updated }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to update task ${id}: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Delete a task
  mcp.registerTool(
    "delete_task",
    {
      description: "Delete a task and remove all its dependency links",
      inputSchema: z.object({
        id: z.string().describe("Task ID to delete"),
      }),
    },
    async ({ id }) => {
      try {
        workflowStore.deleteTask(id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, deletedId: id }),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to delete task ${id}: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Add dependency
  mcp.registerTool(
    "add_dependency",
    {
      description: "Add an execution dependency: task 'from' must complete before task 'to' starts",
      inputSchema: z.object({
        from: z.string().describe("Prerequisite task ID"),
        to: z.string().describe("Dependent task ID"),
      }),
    },
    async ({ from, to }) => {
      try {
        workflowStore.addDependency(from, to);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, dependency: { from, to } }),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to add dependency: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Remove dependency
  mcp.registerTool(
    "remove_dependency",
    {
      description: "Remove an execution dependency between two tasks",
      inputSchema: z.object({
        from: z.string().describe("Prerequisite task ID"),
        to: z.string().describe("Dependent task ID"),
      }),
    },
    async ({ from, to }) => {
      try {
        workflowStore.removeDependency(from, to);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, removed: { from, to } }),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to remove dependency: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}

