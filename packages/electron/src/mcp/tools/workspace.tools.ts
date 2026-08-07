import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { workflowStore } from "../../store/index.js";
import {
  yamlToDag,
  dagToWorkflow,
  dagToYaml,
  workflowToDag,
} from "../../services/parser.js";

/**
 * Registers workspace file tools for loading and saving workflows to disk.
 */
export function registerWorkspaceTools(mcp: McpServer) {
  // List workflows in workspace directory
  mcp.registerTool(
    "list_workspace_workflows",
    {
      description: "List all .yaml or .yml workflow files in a workspace directory",
      inputSchema: z.object({
        dirPath: z.string().describe("Absolute directory path"),
      }),
    },
    async ({ dirPath }) => {
      try {
        if (!fs.existsSync(dirPath)) {
          throw new Error("Directory does not exist");
        }
        const files = await fs.promises.readdir(dirPath);
        const yamlFiles = files
          .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
          .map((f) => f.replace(/\.(yaml|yml)$/, ""));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ dirPath, workflows: yamlFiles }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to list workspace directory: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Load workflow from workspace file
  mcp.registerTool(
    "load_workspace_workflow",
    {
      description: "Load a named workflow YAML file from a workspace directory into Orchestra",
      inputSchema: z.object({
        dirPath: z.string().describe("Absolute directory path"),
        name: z.string().describe("Workflow name (without extension)"),
      }),
    },
    async ({ dirPath, name }) => {
      try {
        const filePath = path.join(dirPath, `${name}.yaml`);
        let content = "";
        if (!fs.existsSync(filePath)) {
          const altFilePath = path.join(dirPath, `${name}.yml`);
          if (fs.existsSync(altFilePath)) {
            content = await fs.promises.readFile(altFilePath, "utf-8");
          } else {
            throw new Error(`Workflow file ${name}.yaml or ${name}.yml not found`);
          }
        } else {
          content = await fs.promises.readFile(filePath, "utf-8");
        }

        const dag = yamlToDag(content);
        const { tasks: newTasks, dependencies: newDeps } = dagToWorkflow(dag);
        workflowStore.setWorkflow(newTasks, newDeps);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  loadedWorkflow: name,
                  taskCount: newTasks.length,
                  dependencyCount: newDeps.length,
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
              text: `Failed to load workspace workflow: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Save active workflow to workspace file
  mcp.registerTool(
    "save_workspace_workflow",
    {
      description: "Save the active workflow state as a YAML file in a workspace directory",
      inputSchema: z.object({
        dirPath: z.string().describe("Absolute directory path"),
        name: z.string().describe("Workflow filename (without extension)"),
      }),
    },
    async ({ dirPath, name }) => {
      try {
        const currentTasks = workflowStore.getTasks();
        const currentDeps = workflowStore.getDependencies();
        const dag = workflowToDag(currentTasks, currentDeps, name, 1);
        const content = dagToYaml(dag);
        const filePath = path.join(dirPath, `${name}.yaml`);

        await fs.promises.writeFile(filePath, content, "utf-8");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: true, savedPath: filePath },
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
              text: `Failed to save workspace workflow: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
