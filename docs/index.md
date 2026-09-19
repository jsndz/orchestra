# Orchestra Documentation Hub

Welcome to the official **Orchestra** documentation! Orchestra is an open-source, local-first workflow orchestration desktop tool built for developers.

---

## 📚 Documentation Sections

1. **[Getting Started](getting-started.md)**
   - Installation guide for Linux (`.AppImage`, `.deb`, `.pacman`), macOS (`.dmg`), and Windows (`.exe`).
   - Running Orchestra in local development mode.

2. **[YAML Specification Reference](yaml-spec.md)**
   - Full schema guide for defining tasks, DAG dependencies, ready checks (`port`, `http`, `log`, `exit`), and environment variables.

3. **[MCP Tools Reference](mcp-reference.md)**
   - Complete reference for all 25 Model Context Protocol tools supported by Orchestra's `stdio` and HTTP transports.

4. **[Architecture Overview](architecture.md)**
   - Deep dive into Orchestra's local-first architecture, Electron main/renderer IPC bridges, process tree management, and DAG execution engine.

---

## 🚀 Key Features

- **Local-First & Offline Capable**: Direct execution on your machine with zero cloud dependencies or remote latency.
- **Visual DAG Editor**: Drag-and-drop workflow canvas with automated cycle detection.
- **Native Terminal PTY Streams**: Live terminal output for every background job and API service.
- **Model Context Protocol (MCP)**: Native integration allowing AI assistants (Claude, Cursor, Antigravity, Windsurf) to control and introspect workflows.
