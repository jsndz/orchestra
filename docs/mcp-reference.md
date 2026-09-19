# MCP (Model Context Protocol) Reference

Orchestra includes a full-featured, local-first MCP server providing **25 specialized tools** for AI assistants (such as Claude Desktop, Cursor, Antigravity, and Windsurf).

---

## 🛠 Available MCP Tools

### Workflow Execution & Control

| Tool | Parameters | Description |
| :--- | :--- | :--- |
| `start_workflow` | None | Starts execution of the currently loaded workflow DAG |
| `stop_workflow` | None | Stops all currently running processes in the active workflow |
| `run_workflow` | None | Executes the workflow DAG and waits for task readiness |

### Task Management

| Tool | Parameters | Description |
| :--- | :--- | :--- |
| `list_tasks` | None | Returns a list of all tasks in the current workflow |
| `get_task_status` | `taskId: string` | Returns execution state, exit code, and readiness for a task |
| `create_task` | `task, command, folder, type, ready` | Creates a new task in the workflow DAG |
| `update_task` | `id, command, type, ready, env, retries, timeout` | Updates fields on an existing task |
| `delete_task` | `id: string` | Removes a task and its associated dependencies |

### YAML Import & Export

| Tool | Parameters | Description |
| :--- | :--- | :--- |
| `yaml_export` | None | Exports the current active workflow as a YAML string |
| `yaml_import` | `yamlContent: string` | Imports and replaces active workflow from YAML string |
| `load_workspace_workflow` | `folder, name` | Loads a saved `.yaml` file from local workspace directory |
| `import_yaml_workspace` | `filePath: string` | Imports a `.yaml` workflow directly from disk path |

### System & Telemetry

| Tool | Parameters | Description |
| :--- | :--- | :--- |
| `system_health` | None | Returns CPU usage, RAM utilization, and active daemon state |
| `list_system_resources` | None | Lists active port bindings and process statistics |
| `kill_process` | `pid: number` | Terminates a process and its child process tree safely |
| `get_process_tree` | `pid: number` | Returns the child process tree hierarchy for a process |

---

## 🔌 Connection Setup

### Stdio Transport (CLI)
Command: `orchestra-mcp`

`.mcp.json`:
```json
{
  "mcpServers": {
    "orchestra": {
      "command": "orchestra-mcp"
    }
  }
}
```

### HTTP / SSE Transport
Endpoint: `http://127.0.0.1:3030/mcp`
Authentication Header: `Authorization: Bearer <TOKEN>`
