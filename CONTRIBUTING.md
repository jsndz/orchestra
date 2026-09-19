# Contributing to Orchestra

Thank you for your interest in contributing to **Orchestra**! Orchestra is an open-source, local-first workflow orchestration desktop tool built with Electron, React, TypeScript, and Node.js.

We welcome contributions from developers of all skill levels. This guide will help you get your local development environment set up and outline our process for submitting issues and pull requests.

---

## 📜 Table of Contents

- [Local Development Setup](#-local-development-setup)
- [Project Architecture](#-project-architecture)
- [Development Workflow](#-development-workflow)
- [Code Style & Guidelines](#-code-style--guidelines)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Submitting Pull Requests](#-submitting-pull-requests)
- [Issue Labeling Conventions](#-issue-labeling-conventions)

---

## 🛠 Local Development Setup

### Prerequisites

Ensure you have the following installed on your developer machine:

- **Node.js**: v20.x or higher (v22 LTS recommended)
- **npm**: v10.x or higher
- **Git**: Latest version

### Repository Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/orchestra.git
   cd orchestra
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build Core Packages**:
   ```bash
   npm run build
   ```

---

## 🏗 Project Architecture

Orchestra is structured as an npm workspace monorepo:

- **`packages/shared`**: Core shared types, DAG execution engine, process runner, YAML parser, and MCP tool handlers.
- **`packages/electron`**: Electron main process, IPC listeners, window management, and native system integration.
- **`packages/client`**: React frontend desktop UI (built with Vite, TailwindCSS, Zustand, and Lucide icons).
- **`packages/mcp-cli`**: Standalone `stdio` CLI transport executable for local Model Context Protocol integration (`orchestra-mcp`).
- **`packages/web`**: Static showcase landing page for the Orchestra desktop app.

---

## 💻 Development Workflow

### Running the Desktop App in Development Mode

Run the React client dev server and launch Electron:

```bash
# Terminal 1: Start React frontend client dev server
npm run client:dev

# Terminal 2: Build Electron main process and start app
npm start
```

### Building Desktop Packages Locally

To test local desktop installer packaging (`.AppImage`, `.deb`, `.pacman`, `.dmg`, `.exe`):

```bash
npm run dist
```

Packaging output artifacts will be placed in the `dist/` folder.

---

## 🎨 Code Style & Guidelines

- **Language**: TypeScript (`strict` mode enabled).
- **Formatting**: Standard 2-space indentation.
- **Imports**: Use explicit relative imports or workspace package paths (`@orchestra/shared`).
- **Architecture Integrity**: Keep Orchestra strictly **local-first**. Do not introduce remote server/cloud database dependencies or cloud execution platform integrations. All operations execute locally on the developer's machine.

---

## 🧪 Testing & Quality Assurance

Run the test suite locally before creating a pull request:

```bash
npm test
```

All tests are located in `tests/*.test.ts` and run via the native Node.js test runner (`node --test`). Ensure all unit and integration test suites pass with 0 errors.

---

## 🔀 Submitting Pull Requests

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-amazing-feature
   ```

2. **Commit Changes**:
   Write clear, descriptive commit messages:
   ```bash
   git commit -m "feat(mcp): add validation for task port checks"
   ```

3. **Push and Create PR**:
   Push your feature branch to your fork and open a Pull Request against the `main` branch of `jsndz/orchestra`.

4. **PR Guidelines**:
   - Provide a clear summary of what changes were made and why.
   - Reference related issues (e.g., `Fixes #42`).
   - Verify that all CI checks (`npm test` and build checks) pass cleanly.

---

## 🏷 Issue Labeling Conventions

We organize issues using the following standardized GitHub labels:

| Label | Description |
| :--- | :--- |
| `bug` | Software defects or incorrect behavior |
| `enhancement` | New feature requests or visual/UX improvements |
| `documentation` | Changes or additions to documentation/README |
| `mcp` | Model Context Protocol tool & server issues |
| `electron` | Electron main process, IPC, or packaging issues |
| `good first issue` | Good issues for first-time contributors |
| `help wanted` | Complex issues requiring community assistance |
