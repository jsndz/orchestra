# Orchestra

Orchestra is a powerful Electron + React application designed for building and executing workflow Directed Acyclic Graphs (DAGs). It simplifies the management of complex task dependencies with a visual editor and a robust execution engine.


## Features

- **Visual Workflow Editor:** Build and manage DAGs using an intuitive node-based interface.
- **Task Management:** Define task metadata, including commands, working directories, and execution types.
- **Graph Analysis:** Automatically detect cycles, calculate execution order, and identify unreachable nodes.
- **Real-time Execution:** Monitor workflow progress with live terminal streams for each task.
- **YAML Support:** Seamlessly import and export workflow configurations in standard YAML format.
- **System Monitoring:** Integrated view of CPU, memory, and platform statistics.
- **Local-First:** Direct access to the local environment with zero-latency task orchestration.

## Tech Stack

- **Shell:** [Electron](https://www.electronjs.org/)
- **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Workflow Engine:** Node.js child processes + [`node-pty`](https://github.com/microsoft/node-pty)
- **Visualization:** [React Flow](https://reactflow.dev/)

## Project Structure

```text
orchestra/
├── main.js                 # Electron main process entry
├── electron/               # Main-process services, IPC handlers, and execution logic
│   ├── src/                # TypeScript source for Electron services
│   └── preload.js          # Preload script for secure IPC bridge
├── client/                 # React renderer application
│   └── src/                # Frontend source code
└── assets/                 # Application icons and static resources
```

## Prerequisites

- **Node.js:** 20.x or higher
- **npm:** 10.x or higher
- **Platforms:** Linux, macOS, Windows

## Installation

Install dependencies for both the root and the client application:

```bash
# Install root and Electron dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

## Development

The application requires two concurrent processes during development:

1. **Frontend Dev Server:**

   ```bash
   cd client
   npm run dev
   ```

2. **Electron App:** (In a new terminal)
   ```bash
   npm start
   ```

Electron will automatically load the frontend from `http://localhost:6080`.

##  Building & Packaging

### Compile Electron

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

### Client Project

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Generates the production bundle for the frontend.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run typecheck`: Validates TypeScript types.

## License

This project is licensed under the [MIT License](LICENSE).
