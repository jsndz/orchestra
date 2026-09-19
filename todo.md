# Orchestra — TODO

> [!IMPORTANT]
> **LOCAL-FIRST DESKTOP APPLICATION MANDATE:**
> Orchestra is strictly a **local desktop workflow management system (Electron application)** that runs offline on the developer's machine. All features, integrations, documentation, showcase landing pages, and MCP tools MUST treat Orchestra as a local-first desktop application executing local processes and terminals. No cloud hosting, web server platform hosting, remote process execution, or cloud infrastructure should be introduced. The `packages/web` package is solely a static showcase landing page for the desktop application.

## Phase 1: Critical Fixes (Before Public Release)

- [x] **1. Fix MCP tool placeholders & error handling**
  - [x] Implement actual `run_workflow` and `stop_workflow` logic (registered `run_workflow` alias and ensured execution workflow runner integration)
  - [x] Replace `z.any()` with a proper typed schema in `update_task` (added `readyKind`, `readyPort`, `readyLogMatch`, `readyHttpUrl`, `onwatch`, and type validations)
  - [x] Add try/catch + meaningful error responses to all tool handlers
  - [x] Add file-existence checks in `import_yaml_workspace` / `load_workspace_workflow`
  - [x] Fix `start_workflow` silently masking cycle errors (returns `isError: true` when `result.ok` is false)
  - [x] Use `killProcessTree` instead of `killProcess` in `kill_process` tool
  - [x] Add `.int().min(1).max(65535)` validation on port params, `.nonneg()` on pid/timeout/retries

- [x] **2. Add `stdio` MCP transport**
  - [x] Create a standalone CLI entrypoint (`packages/mcp-cli/`) over `StdioServerTransport`

- [x] **3. Add authentication to local MCP server**
  - [x] Add bearer token / shared secret auth to HTTP endpoints in `packages/shared/src/mcp/server.ts`
  - [x] Auto-generate a random token on app startup, expose in UI for copy-paste
  - [x] Bind MCP server to `127.0.0.1` loopback only (not `0.0.0.0`)

- [x] **4. Fix broken CI build script**
  - [x] Fix `cd client` → `cd packages/client` in `.github/workflows/build.yml`
  - [x] Change trigger from `workflow_dispatch` (manual-only) to also run on `push` / `pull_request`

- [x] **5. Fill missing project metadata**
  - [x] Add `author` ("Jaison D'souza"), `repository`, `homepage`, `bugs`, `keywords` to root `package.json`
  - [x] Add `description` to each workspace package's `package.json`

- [x] **6. Expand `.gitignore`**
  - [x] `.DS_Store`, `Thumbs.db`
  - [x] `.env`, `.env.local`, `.env.*.local`
  - [x] `*.log`, `npm-debug.log*`, `.orchestra-logs/`
  - [x] `*.tsbuildinfo`, `coverage/`
  - [x] `.idea/`, `*.swp`, `*.swo`

---

## Phase 2: Open-Source Essentials

- [x] **7. Add CONTRIBUTING.md**
  - [x] Desktop app dev environment setup
  - [x] Code style / linting expectations
  - [x] PR process and review expectations
  - [x] Issue labeling conventions

- [x] **8. Add CODE_OF_CONDUCT.md**
  - [x] Adopt Contributor Covenant (v2.1)

- [x] **9. Expand GitHub Actions CI/CD**
  - [x] New CI workflow: `npm test`, `npm run build` on every PR (`.github/workflows/ci.yml`)
  - [x] Build workflow: verify desktop binaries on Linux, macOS, Windows (`.github/workflows/build.yml`)
  - [x] Release workflow: auto-build desktop binaries on tagged releases (`.github/workflows/release.yml`)
  - [x] Add status badges to README

- [x] **10. Expand test coverage**
  - [x] Unit tests for each MCP tool handler (`tests/mcp.test.ts`)
  - [x] DAG execution engine tests (`tests/dag.test.ts`)
  - [x] YAML import/export round-trip tests (`tests/yaml_roundtrip.test.ts`)
  - [x] Local MCP server HTTP lifecycle test (`tests/mcp_server_http.test.ts`)

---

## Phase 3: Developer Experience Polish

- [x] **11. Clean up unused dependencies & orphaned pages**
  - [x] Remove `@supabase/supabase-js` and `axios` from `packages/client/package.json`
  - [x] Remove `postgres` from `packages/web/package.json`
  - [x] Wire up `AnalysisPage.tsx` and `ReportPage.tsx` into `App.tsx` routes (`/analysis`, `/report`)

- [x] **12. Add React Error Boundaries**
  - [x] Top-level Error Boundary wrapping desktop app root (`ErrorBoundary.tsx`)
  - [x] Route-level Error Boundaries for `/tasks`, `/execution`, `/analysis`, and `/report`
  - [x] Replace all `alert()` calls with Toast notifications (`Toast.tsx`)

- [x] **13. Document MCP in README**
  - [x] Dedicated "MCP Integration" section listing all 25 tools
  - [x] Connection instructions for Claude Desktop, Cursor, Antigravity, Windsurf
  - [x] `.mcp.json` / `claude_desktop_config.json` snippets

- [x] **14. Add visual demos to README**
  - [x] Visual diagram of the node-based workflow editor in the Electron desktop app
  - [x] Visual demonstration of an AI agent using MCP to control Orchestra locally

- [x] **15. Improve accessibility (a11y)**
  - [x] Add keyboard handlers and semantic button roles to interactive elements
  - [x] Add terminal accessibility features and live log streams
  - [x] Increase minimum font size to 11px/12px for clear legibility

- [x] **16. Auto-import from existing project configs**
  - [x] `package.json` scripts → Orchestra workflow (`autoimport.ts`)
  - [x] `docker-compose.yml` → Orchestra workflow (`autoImportDockerCompose`)
  - [x] `Procfile` / `Makefile` → Orchestra workflow (`autoImportProcfile`)

- [x] **17. One-click AI client configuration**
  - [x] "Connect to AI Assistant" button in UI (`McpSetupModal.tsx`)
  - [x] Auto-generate and copy MCP config snippet
  - [x] Support Claude Desktop, Cursor, Windsurf, `.mcp.json` format

---

## Phase 4: Growth & Community

- [x] **18. Publish to npm**
  - [x] `@orchestra/mcp-cli` prepared for npm publishing (`publishConfig: { access: "public" }`)
  - [x] Core packages scoped and ready for publishing

- [x] **19. Improve showcase landing page (`packages/web`)**
  - [x] Position explicitly as a local-first desktop developer tool (NOT a web server / cloud hosting SaaS)
  - [x] Feature showcase section with local terminal & DAG process management visuals
  - [x] "MCP Integration" section highlighting local AI assistant control (`McpSection.tsx`)
  - [x] Removed unused `postgres` dependency

- [x] **20. Create documentation site**
  - [x] Main Documentation Hub (`docs/index.md`)
  - [x] Getting Started & Installation guide (`docs/getting-started.md`)
  - [x] 25 MCP tools reference (`docs/mcp-reference.md`)

- [x] **21. Add CHANGELOG.md**
  - [x] Keep a Changelog format (`CHANGELOG.md`)

- [x] **22. Pre-built binary releases**
  - [x] Automated desktop installer builds (`.AppImage`, `.deb`, `.pacman`, `.dmg`, `.exe`)
  - [x] Release tag GitHub Actions workflow (`.github/workflows/release.yml`)

- [x] **23. Workflow template gallery**
  - [x] `Next.js + Prisma + PostgreSQL` local dev template (`templates/nextjs-prisma-pg.yaml`)
  - [x] `Django + Celery + Redis` local dev template (`templates/django-celery-redis.yaml`)
  - [x] `Monorepo (Turborepo / Nx)` local dev template (`templates/monorepo-turborepo.yaml`)
  - [x] Community-contributed local templates gallery (`templates/README.md`)
