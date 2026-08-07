import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTaskTools } from "./tasks.tools.js";
import { registerExecutionTools } from "./execution.tools.js";
import { registerYamlTools } from "./yaml.tools.js";
import { registerSystemTools } from "./system.tools.js";
import { registerWorkspaceTools } from "./workspace.tools.js";

/**
 * Registers all domain MCP tools into the given McpServer instance.
 */
export function registerAllMcpTools(mcp: McpServer) {
  registerTaskTools(mcp);
  registerExecutionTools(mcp);
  registerYamlTools(mcp);
  registerSystemTools(mcp);
  registerWorkspaceTools(mcp);
}

export {
  registerTaskTools,
  registerExecutionTools,
  registerYamlTools,
  registerSystemTools,
  registerWorkspaceTools,
};
