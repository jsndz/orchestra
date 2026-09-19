# Changelog

All notable changes to **Orchestra** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-20

### Added
- **Local Desktop Launcher & Installer Packages**: Added support for `.AppImage`, `.deb`, and `.pacman` Linux installers alongside macOS `.dmg` and Windows `.exe`.
- **Model Context Protocol (MCP)**: Native stdio CLI (`orchestra-mcp`) and authenticated HTTP/SSE server supporting 25 AI tools.
- **DAG Execution Engine**: Topological ordering, parallel level execution, and automatic cycle detection.
- **Auto-Importer**: One-click import for `package.json` scripts, `docker-compose.yml`, `Procfile`, and `Makefile`.
- **React Error Boundaries & Toast System**: Top-level & route-level error boundaries with non-blocking toast notifications replacing legacy `alert()` dialogs.
- **Comprehensive Test Suite**: Automated tests for DAG engine, MCP HTTP lifecycle, YAML round-trips, and file watcher.
- **GitHub Actions CI/CD Workflows**: Added automated testing, multi-platform desktop build verification, and release tag installer publishing.

### Changed
- Refactored Electron main process IPC handlers to relative exports, preventing ESM `ERR_MODULE_NOT_FOUND` errors in packed `app.asar`.
- Streamlined `HomePage.tsx` into an operational Electron Command Hub with persistent recent workflow history.
