import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getStaticStats, getDynamicStats } from "../../utils/os.js";
import { checkPort, killProcess } from "../../utils/ports.js";

/**
 * Registers OS stats, system diagnostic, and port management tools with the MCP server.
 */
export function registerSystemTools(mcp: McpServer) {
  // Static OS stats
  mcp.registerTool(
    "get_system_stats",
    {
      description: "Get system hardware and operating system statistics (CPU, memory, OS details)",
    },
    async () => {
      const staticStats = getStaticStats();
      const dynamicStats = getDynamicStats();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { ...staticStats, dynamic: dynamicStats },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Check if a port is in use
  mcp.registerTool(
    "check_port",
    {
      description: "Check if a local TCP port is currently in use and get process details",
      inputSchema: z.object({
        port: z.number().describe("Port number to check"),
      }),
    },
    async ({ port }) => {
      try {
        const info = await checkPort(port);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to check port ${port}: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Kill process by PID
  mcp.registerTool(
    "kill_process",
    {
      description: "Kill a running system process by PID",
      inputSchema: z.object({
        pid: z.number().describe("Process ID (PID) to kill"),
      }),
    },
    async ({ pid }) => {
      try {
        await killProcess(pid);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, killedPid: pid }),
            },
          ],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to kill process ${pid}: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
