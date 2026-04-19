# Orchestra

Orchestra is an Electron + React application for building and running workflow DAGs (directed acyclic graphs) made of **jobs** and **services**.

It provides a visual task/dependency editor, execution dashboard, terminal stream view, graph/log view, and YAML import/export for workflows.

## Features

- Build workflows as nodes and dependencies
- Edit task metadata (command, folder, type, readiness)
- Analyze graph properties (order, cycle detection, parallel levels, terminal/unreachable nodes)
- Run workflow execution from the desktop app
- Stream per-task terminal output during execution
- Stop individual tasks or full execution
- Import workflow from YAML and export workflow to YAML
- View system stats (CPU, memory, platform)

## Tech Stack

- **Desktop shell:** Electron
- **Frontend:** React + TypeScript + Vite + Tailwind
- **State/UI:** Zustand, React Query, shadcn/ui-style components
- **Execution/runtime:** Node.js child processes + `node-pty`
- **Workflow format:** YAML

## Project Structure

```text
orchestra/
├── main.js                 # Electron main entry
├── electron/               # Main-process services, IPC handlers, execution logic
├── client/                 # React renderer app (Vite)
└── docs/                   # Internal docs and implementation notes
```

## Prerequisites

- Node.js 20+
- npm 10+
- Linux/macOS/Windows (development is currently configured for local dev mode)

## Install

Install dependencies in both root and renderer app:

```bash
# from repository root
npm install

# install renderer dependencies
cd client && npm install
```

## Run in Development

The app runs in **two processes**:

1. Vite dev server (renderer) on port `6080`
2. Electron main process

Open two terminals from the repository root:

```bash
# Terminal 1
cd client
npm run dev
```

```bash
# Terminal 2
npm start
```

Then Electron opens and loads the renderer from `http://localhost:6080`.

## Build

### Build Electron TypeScript only

```bash
npm run electron:build
```

### Build renderer assets

```bash
cd client
npm run build
```

> Note: `main.js` is currently set to `isDev = true`, so packaged/static loading is not yet the default runtime path.

## Scripts

### Root (`package.json`)

- `npm run electron:build` — compile `electron/src` to `electron/dist`
- `npm start` — build Electron TypeScript, then launch Electron

### Client (`client/package.json`)

- `npm run dev` — start Vite dev server (port 6080)
- `npm run build` — build production frontend bundle
- `npm run preview` — preview built frontend
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript type checks

## IPC Surface (high level)

The preload bridge (`electron/preload.js`) exposes APIs such as:

- task CRUD + dependency CRUD
- graph analysis operations
- execution start/stop
- terminal and execution event subscriptions
- YAML import/export
- system stats

## Documentation

See the `docs/` folder:

- `docs/execution.md` — process execution and stream behavior notes
- `docs/DataModeling.md` — modeling guidance used in the project
- `docs/fixingTerminalView.md` — terminal view implementation notes

## Current Notes

- Home route (`/`) is currently minimal.
- Main user flows are available via `/tasks` and `/execution`.
- Electron opens DevTools by default in `main.js`.

## License

ISC
