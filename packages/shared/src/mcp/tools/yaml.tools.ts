import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { workflowStore } from "../../store/index.js";
import {
  yamlToDag,
  dagToWorkflow,
  dagToYaml,
  workflowToDag,
} from "../../services/parser.js";

/**
 * Registers YAML conversion & import/export tools with the MCP server.
 */
export function registerYamlTools(mcp: McpServer) {
  // Export active workflow to YAML string
  mcp.registerTool(
    "export_yaml",
    {
      description: "Export the active workflow as an Orchestra YAML definition string",
      inputSchema: z.object({
        workflowName: z
          .string()
          .default("workflow")
          .describe("Name of the workflow"),
      }),
    },
    async ({ workflowName }) => {
      try {
        const currentTasks = workflowStore.getTasks();
        const currentDeps = workflowStore.getDependencies();
        const dag = workflowToDag(currentTasks, currentDeps, workflowName, 1);
        const yamlString = dagToYaml(dag);

        return {
          content: [
            {
              type: "text",
              text: yamlString,
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to export YAML: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Import workflow from YAML string
  mcp.registerTool(
    "import_yaml",
    {
      description: "Import and set a new workflow from an Orchestra YAML content string",
      inputSchema: z.object({
        yamlContent: z.string().describe("YAML workflow content string"),
      }),
    },
    async ({ yamlContent }) => {
      try {
        const dag = yamlToDag(yamlContent);
        const { tasks: newTasks, dependencies: newDeps } = dagToWorkflow(dag);
        workflowStore.setWorkflow(newTasks, newDeps);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                taskCount: newTasks.length,
                dependencyCount: newDeps.length,
              }),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to import YAML: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
