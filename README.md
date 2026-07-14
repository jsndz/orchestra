# Orchestra

Orchestra is a desktop developer tool designed to make setting up and running local development projects much easier. 

When working on modern projects, you often need to run multiple commands at the same time—such as starting a backend database, spinning up an API server, running build steps, and launching a frontend web server. Managing multiple terminal tabs, running commands in the correct sequence, and troubleshooting startup errors can be tedious.

Orchestra simplifies this process by providing a visual, node-based editor. You can map out all your commands, define which tasks depend on others (for example, starting the database before launching the server), and run your entire environment with a single click. Each task runs in its own live terminal window inside the app, letting you easily monitor logs and test your project on `localhost`.

## Features

- **Visual Setup Editor:** Map out your project commands and workflow using an intuitive drag-and-drop node-based interface.
- **Task & Command Management:** Specify the exact command, directory, and environment variables needed for each part of your project.
- **Smart Execution Order:** Automatically calculates the correct sequence to start your services. It will also alert you if two tasks are accidentally waiting on each other (circular dependency).
- **Real-Time Logs:** Monitor your web servers, databases, and background tasks using live terminal streams for every command.
- **Save & Share Workflows:** Export your project configuration to a simple YAML file so other developers can import it and start their servers instantly.
- **System Resource Monitoring:** Keep track of your CPU and memory usage to ensure your local servers are not overloading your machine.
- **Local-First:** Runs entirely on your computer, giving the app direct access to your local files and commands with zero latency.

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
