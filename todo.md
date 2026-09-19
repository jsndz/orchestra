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

- [ ] **11. Clean up unused dependencies & orphaned pages**
  - [ ] Remove `@supabase/supabase-js` and `axios` from `packages/client/package.json`
  - [ ] Remove `postgres` from `packages/web/package.json`
  - [ ] Wire up or remove `AnalysisPage.tsx` and `ReportPage.tsx` (unrouted in `App.tsx`)

- [ ] **12. Add React Error Boundaries**
  - [ ] Top-level Error Boundary wrapping desktop app root
  - [ ] Route-level Error Boundaries for `/tasks` and `/execution`
  - [ ] Replace all `alert()` calls with toast notifications

- [ ] **13. Document MCP in README**
  - [ ] Dedicated "MCP Integration" section listing all 25 tools
  - [ ] Connection instructions for Claude Desktop, Cursor, Antigravity
  - [ ] `.mcp.json` / `claude_desktop_config.json` snippets

- [ ] **14. Add visual demos to README**
  - [ ] GIF of the node-based workflow editor in the Electron desktop app
  - [ ] GIF of an AI agent using MCP to control Orchestra locally

- [ ] **15. Improve accessibility (a11y)**
  - [ ] Add `role="button"`, `tabIndex={0}`, keyboard handlers to clickable divs/spans
  - [ ] Add `@xterm/addon-accessibility` to terminal instances
  - [ ] Add `aria-live` regions for streamed log output
  - [ ] Increase minimum font size to 11px (currently `text-[7px]`/`text-[8px]` in places)

- [ ] **16. Auto-import from existing project configs**
  - [ ] `package.json` scripts → Orchestra workflow
  - [ ] `docker-compose.yml` → Orchestra workflow
  - [ ] `Procfile` / `Makefile`

- [ ] **17. One-click AI client configuration**
  - [ ] "Connect to AI Assistant" button in UI
  - [ ] Auto-generate and copy MCP config snippet
  - [ ] Support Claude Desktop, Cursor, Windsurf, `.mcp.json` format

---

## Phase 4: Growth & Community

- [ ] **18. Publish to npm**
  - [ ] `@orchestra/mcp` as standalone package for local MCP integration
  - [ ] Core packages with proper scoping

- [ ] **19. Improve showcase landing page (`packages/web`)**
  - [ ] Position explicitly as a local-first desktop developer tool (NOT a web server / cloud hosting SaaS)
  - [ ] Feature showcase section with screenshots/GIFs of local terminal & DAG process management
  - [ ] "MCP Integration" section highlighting local AI assistant control
  - [ ] Remove unused `postgres` dependency

- [ ] **20. Create documentation site**
  - [ ] Use VitePress / Docusaurus / Starlight
  - [ ] Sections: Getting Started, Configuration, MCP Tools Reference, Architecture, FAQ
  - [ ] Deploy static docs to GitHub Pages

- [ ] **21. Add CHANGELOG.md**
  - [ ] Keep a Changelog format
  - [ ] Automate with conventional commits

- [ ] **22. Pre-built binary releases**
  - [ ] Desktop installers (`.AppImage`, `.dmg`, `.exe`) on every GitHub Release
  - [ ] Wire into release CI workflow from step 9

- [ ] **23. Workflow template gallery**
  - [ ] `Next.js + Prisma + PostgreSQL` local dev template
  - [ ] `Django + Celery + Redis` local dev template
  - [ ] `Monorepo (Turborepo / Nx)` local dev template
  - [ ] Community-contributed local templates
