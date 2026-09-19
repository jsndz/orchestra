# Orchestra

[![CI](https://github.com/jsndz/orchestra/actions/workflows/ci.yml/badge.svg)](https://github.com/jsndz/orchestra/actions/workflows/ci.yml)
[![Build Desktop Apps](https://github.com/jsndz/orchestra/actions/workflows/build.yml/badge.svg)](https://github.com/jsndz/orchestra/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Local First](https://img.shields.io/badge/Architecture-Local--First-emerald.svg)](#-local-first-architecture)

Orchestra is a local-first desktop application designed for local development. **It is installed and executed entirely on your local machine.**

When working on modern projects, you often need to run multiple commands at the same time—such as starting a backend database, spinning up an API server, running build steps, and launching a frontend web server. Managing multiple terminal tabs, running commands in the correct sequence, and troubleshooting startup errors can be tedious.

Orchestra simplifies this process by providing a visual, node-based editor. You can map out all your commands, define which tasks depend on others (for example, starting the database before launching the server), and run your entire environment with a single click. Each task runs in its own live terminal window inside the app, letting you easily monitor logs and test your project on `localhost`.

## 📺 Visual Demos

```text
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  ORCHESTRA COMMAND HUB  ::  DAEMON :: ACTIVE (:3030)                        │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │                                                                             │
  │    [ PostgreSQL (5432) ]  ───►  [ API Server (3000) ]  ───►  [ Web (6080) ] │
  │    (Ready: Port 5432)           (Ready: HTTP /health)        (Ready: Exit)   │
  │                                                                             │
  │  ─────────────────────────────────────────────────────────────────────────  │
  │  LIVE TERMINAL STREAMS:                                                     │
  │  ▸ [PostgreSQL]  LOG: database system is ready to accept connections        │
  │  ▸ [APIServer]   LOG: Server running on http://localhost:3000                │
  │  ▸ [WebClient]   LOG: Local server ready at http://localhost:6080            │
  └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 MCP (Model Context Protocol) Integration

Orchestra features a native, local-first **Model Context Protocol (MCP)** server. This allows AI assistants (such as Claude Desktop, Cursor, Antigravity, and Windsurf) to introspect, construct, run, and monitor local development workflows directly on your machine.

### Available MCP Tools (25 Tools)

| Tool Category | Tools | Description |
| :--- | :--- | :--- |
| **Workflow Control** | `start_workflow`, `stop_workflow`, `run_workflow` | Start, halt, or execute local DAG workflow runs |
| **Task Management** | `list_tasks`, `get_task_status`, `create_task`, `update_task`, `delete_task` | Full CRUD operations on local tasks and ready checks |
| **YAML Management** | `yaml_import`, `yaml_export`, `load_workspace_workflow`, `import_yaml_workspace` | Load and export Orchestra `.yaml` workflow specifications |
| **Process Control** | `kill_process`, `get_process_tree` | Inspect and terminate local child process trees safely |
| **System Telemetry** | `system_health`, `list_system_resources` | Monitor local CPU, RAM, and port bindings |

---

### Connecting your AI Assistant

Orchestra provides two local MCP transport mechanisms:

1. **Stdio Transport (CLI)**: Recommended for Claude Desktop and Cursor.
2. **HTTP/SSE Transport**: High-performance HTTP loopback listener bound to `127.0.0.1:3030` with Bearer token authentication.

#### Claude Desktop Configuration (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "orchestra": {
      "command": "orchestra-mcp"
    }
  }
}
```

#### Cursor & Project Level (`.mcp.json`)

```json
{
  "mcpServers": {
    "orchestra": {
      "command": "orchestra-mcp"
    }
  }
}
```

#### HTTP / SSE Authorization Header Format

```http
POST /mcp HTTP/1.1
Host: 127.0.0.1:3030
Authorization: Bearer <YOUR_MCP_TOKEN>
Content-Type: application/json
```

## Tech Stack

- **Shell:** [Electron](https://www.electronjs.org/) (for desktop integration)
- **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Execution Engine:** Node.js child processes + [`node-pty`](https://github.com/microsoft/node-pty) (for running local commands)
- **Visualization:** [React Flow](https://reactflow.dev/) (for the interactive workspace)

## Project Structure

```text
orchestra/
├── main.js                 # Electron main process entry
├── packages/
│   ├── electron/           # Main-process services, IPC handlers, and execution logic
│   ├── client/             # React renderer application source
│   ├── shared/             # Shared TypeScript types and state interfaces
│   └── web/                # Web version source code
├── tests/                  # Integration test suite
└── assets/                 # Application icons and static resources
```

## Prerequisites

- **Node.js:** 20.x or higher
- **npm:** 10.x or higher
- **Platforms:** Linux, macOS, Windows

## Installation

Install dependencies for all workspace packages:

```bash
npm install
``` 

## Development

The application requires concurrent processes during development:

1. **Frontend Dev Server:** 

   ```bash
   npm run client:dev
   ```

2. **Electron App:** (In a new terminal)
   ```bash
   npm start
   ```

Electron will automatically load the frontend from `http://localhost:6080`.

## Building & Packaging

### Compile Electron Services

```bash
npm run electron:build
```

### Build Frontend

```bash
npm run client:build
```

### Full Build (Electron + Frontend)

```bash
npm run build
```

### Create Distribution Package

To package the application for your current platform:

```bash
npm run dist
```

Distributables will be generated in the `dist/` directory.

## Scripts

### Root Project

- `npm start`: Builds Electron and launches the app.
- `npm run build`: Compiles both Electron and Frontend assets.
- `npm run dist`: Packages the application for distribution using `electron-builder`.
- `npm test`: Runs integration test suite.

### Client Project

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Generates the production bundle for the frontend.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run typecheck`: Validates TypeScript types.

## License

This project is licensed under the [MIT License](LICENSE).


