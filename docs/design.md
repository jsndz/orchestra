---
version: alpha
name: Orchestra-UI-design-analysis
description: |
  An engineering-grade desktop user interface organized around a high-contrast dark canvas (#0d0d0d) and structured surface cards (#1f1f1f), connected by a high-visibility mint/cyan primary accent (#e1f4f3 / #10b981) that highlights active tabs, graph node statuses, and execution signals. The system is unapologetically industrial and angular: sharp 0px radius across every desktop surface, dense typography using Inter Variable and JetBrains Mono, and hair-line border rules that separate multi-pane developer workflows. There are no atmospheric blurs or soft drop shadows — just dark surfaces, high-contrast text, streaming terminal output, and DAG dependency graphs stacked into a high-density desktop grid.

colors:
  primary: "#e1f4f3"
  on-primary: "#0d0d0d"
  primary-dark: "#c2d8d7"
  emerald-accent: "#10b981"
  cyan-accent: "#06b6d4"
  teal-accent: "#14b8a6"
  violet-accent: "#8b5cf6"
  ink: "#ffffff"
  canvas: "#0d0d0d"
  surface-dark: "#0d0d0d"
  surface-card: "#1f1f1f"
  surface-muted: "#181b26"
  surface-elevated: "#2a2a2a"
  hairline: "#BFBFBF"
  hairline-subtle: "rgba(255,255,255,0.12)"
  body: "#ffffff"
  mute: "#bfbfbf"
  stone: "#898989"
  ash: "#555555"
  on-dark: "#ffffff"
  on-dark-mute: "rgba(255,255,255,0.7)"
  error: "#ef4444"
  warning: "#f59e0b"
  success: "#10b981"

typography:
  display-xl:
    fontFamily: Inter Variable
    fontSize: 36px
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Inter Variable
    fontSize: 28px
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: -0.01em
  heading-xl:
    fontFamily: Inter Variable
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0
  heading-lg:
    fontFamily: Inter Variable
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  heading-md:
    fontFamily: Inter Variable
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: 0
  heading-sm:
    fontFamily: Inter Variable
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0
  card-title:
    fontFamily: Inter Variable
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: Inter Variable
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-strong:
    fontFamily: Inter Variable
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: Inter Variable
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  code-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button-lg:
    fontFamily: Inter Variable
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0.05em
  button-md:
    fontFamily: Inter Variable
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0.05em
  button-sm:
    fontFamily: Inter Variable
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0.05em
  caption-md:
    fontFamily: Inter Variable
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0.1em
    textTransform: uppercase
  caption-sm:
    fontFamily: Inter Variable
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0
  utility-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0.15em
    textTransform: uppercase

rounded:
  none: 0px
  xs: 0px
  sm: 0px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 48px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.none}"
    padding: 10px 20px
    height: 40px
  button-primary-active:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.none}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    typography: "{typography.button-md}"
    rounded: "{rounded.none}"
    padding: 10px 18px
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.none}"
  pill-tab:
    backgroundColor: "transparent"
    textColor: "{colors.mute}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.none}"
    padding: 8px 16px
  pill-tab-active:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.primary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.none}"
  task-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.card-title}"
    rounded: "{rounded.none}"
    padding: 20px
  dag-node:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.none}"
    padding: 14px
  terminal-panel:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.ink}"
    typography: "{typography.code-mono}"
    rounded: "{rounded.none}"
    padding: 16px
  nav-header:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.none}"
    height: 56px
  sidebar-nav:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.mute}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    width: 240px
  mcp-modal:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 32px
---

## Overview

The `@orchestra/client` desktop interface is built like an engineering command workstation — every screen is a dense, high-contrast assembly of DAG visualization nodes, streaming terminal outputs, and pipeline configuration controls arranged on a deep dark canvas (`{colors.canvas}` — `#0d0d0d`). The interface uses a single, high-intensity mint accent (`{colors.primary}` — `#e1f4f3` / `{colors.emerald-accent}` — `#10b981`) to guide developer focus to active execution levels, selected DAG nodes, and system controls.

The architecture strictly rejects consumer software trends: there are no soft gradients, no decorative blurs, no ambient lighting meshes, and no rounded pill buttons. Everything operates under `{rounded.none}` (0px) sharp square geometry, framed by 1px solid hairline rules (`{colors.hairline}` — `#BFBFBF`), creating a CAD-like utility interface designed for maximum information density and zero visual latency.

**Key Characteristics:**
- **Single-Accent Hierarchy**: `{colors.primary}` (`#e1f4f3`) and `{colors.emerald-accent}` (`#10b981`) carry every active node status, terminal cursor, primary action, and execution flow badge.
- **Pure Square Geometry**: `{rounded.none}` (0px) on every card, modal, button, and terminal container.
- **Inter Variable & JetBrains Mono**: Strict 16-tier typography scale separating structural UI controls from code syntax and terminal output.
- **Decoupled Multi-Store Architecture**: React state driven by 4 specialized Zustand stores (`useAppStore`, `useTerminalStore`, `useLogStore`, `useResourceStore`).
- **Context-Isolated IPC Bridge**: Type-safe IPC contract (`window.api`) interfacing directly with Electron's main process and local system binaries.

---

## Colors

### Brand & Accent
- **Primary Mint Accent** (`{colors.primary}` — `#e1f4f3`): Primary active button fills, ring outlines, active tab indicators, and workflow execution badges.
- **Emerald Accent** (`{colors.emerald-accent}` — `#10b981`): Success task status indicators, active terminal output signals, and live watcher highlights.
- **Cyan Accent** (`{colors.cyan-accent}` — `#06b6d4`): Running DAG node status, parallel execution layer badges.
- **Teal Accent** (`{colors.teal-accent}` — `#14b8a6`): Secondary telemetry highlights and file path badges.
- **Violet Accent** (`{colors.violet-accent}` — `#8b5cf6`): Model Context Protocol (MCP) tool badges and AI assistant integration tags.

### Surface & Frame
- **Page Canvas** (`{colors.canvas}` — `#0d0d0d`): Deep black background of the desktop application window.
- **Card Surface** (`{colors.surface-card}` — `#1f1f1f`): Structural containers, navigation headers, task cards, and modal dialogs.
- **Muted Surface** (`{colors.surface-muted}` — `#181b26`): Terminal panel canvas, code preview blocks, and table headers.
- **Hairline Border** (`{colors.hairline}` — `#BFBFBF`): 1px solid structural border separating task nodes, navigation panels, and modal bounds.
- **Hairline Subtle** (`{colors.hairline-subtle}` — `rgba(255,255,255,0.12)`): Inner divider lines between task list items and terminal outputs.

### Text
- **Ink / Text** (`{colors.ink}` — `#ffffff`): Primary headlines, task labels, and active code text on dark surfaces.
- **Mute Text** (`{colors.mute}` — `#bfbfbf`): Metadata, secondary descriptors, inactive tab titles, and dependency tags.
- **Stone Text** (`{colors.stone}` — `#898989`): Disabled options, timestamps, and subtle structural labels.

### Semantic Status
- **Error** (`{colors.error}` — `#ef4444`): Execution failure state, circular dependency warnings, invalid YAML syntax alerts.
- **Warning** (`{colors.warning}` — `#f59e0b`): Unreachable nodes, missing environment variable warnings, port collision alerts.
- **Success** (`{colors.success}` — `#10b981`): Task execution completed, lossless YAML export, clean graph validation.

---

## Typography

### Font Family
- **Inter Variable** (`@fontsource-variable/inter`): Primary sans-serif typeface used across all navigation, headings, cards, and modal components.
- **JetBrains Mono**: Used for pseudo-terminal logs, YAML file editors, task commands, and system resource telemetry.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Purpose / Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `{typography.display-xl}` | 36px | 900 | 1.15 | -0.02em | Hero headers, main dashboard titles |
| `{typography.display-lg}` | 28px | 900 | 1.2 | -0.01em | Primary section headers |
| `{typography.heading-xl}` | 24px | 700 | 1.25 | 0 | Page titles (Execution, Tasks, Analysis) |
| `{typography.heading-lg}` | 20px | 700 | 1.3 | 0 | Modal titles, card section titles |
| `{typography.heading-md}` | 18px | 700 | 1.35 | 0 | Task card titles, DAG level headers |
| `{typography.heading-sm}` | 16px | 700 | 1.4 | 0 | Side-panel group headers |
| `{typography.card-title}` | 15px | 700 | 1.4 | 0 | Task node titles, MCP tool names |
| `{typography.body-md}` | 14px | 400 | 1.5 | 0 | Default body paragraphs, description text |
| `{typography.body-strong}` | 14px | 700 | 1.5 | 0 | Bold UI labels, active button text |
| `{typography.body-sm}` | 13px | 400 | 1.5 | 0 | Secondary metadata, parameter descriptions |
| `{typography.code-mono}` | 13px | 400 | 1.5 | 0 | Streaming terminal output, CLI commands |
| `{typography.button-lg}` | 15px | 700 | 1.25 | 0.05em | Primary execution CTA buttons |
| `{typography.button-md}` | 14px | 700 | 1.25 | 0.05em | Standard modal and panel buttons |
| `{typography.button-sm}` | 12px | 700 | 1.25 | 0.05em | Compact task card action buttons |
| `{typography.caption-md}` | 12px | 700 | 1.4 | 0.1em | Structural section eyebrows (UPPERCASE) |
| `{typography.caption-sm}` | 11px | 400 | 1.3 | 0 | Footnotes, duration badges |
| `{typography.utility-xs}` | 10px | 700 | 1.4 | 0.15em | Status badges, environment tags (UPPERCASE) |

---

## Layout

### Spacing System
- **Base Rhythm**: 8px grid
- **Tokens**: `{spacing.xxs}` (2px) · `{spacing.xs}` (4px) · `{spacing.sm}` (8px) · `{spacing.md}` (12px) · `{spacing.lg}` (16px) · `{spacing.xl}` (24px) · `{spacing.xxl}` (32px) · `{spacing.section}` (48px)
- **Gutters & Padding**: Application views use 24px padding (`{spacing.xl}`), with 16px (`{spacing.lg}`) gaps between task cards and DAG graph node clusters.

### Desktop Layout Architecture
- **Header Navigation Bar** (`{component.nav-header}`): Fixed 56px top bar housing workspace path selector, global navigation links, and system stats.
- **Sidebar Workspace Panel** (`{component.sidebar-nav}`): Fixed 240px left sidebar for workflow navigation, task filtering, and recent workflow presets.
- **Main Viewport**: Flexible multi-pane container rendering ReactFlow canvas, XTerm.js terminal panels, and graph analysis tools.

---

## Elevation & Depth

| Level | Treatment | Application |
| :--- | :--- | :--- |
| **0 — Flat Canvas** | Background `{colors.canvas}` (`#0d0d0d`), no shadow | Window background |
| **1 — Surface Card** | Background `{colors.surface-card}` (`#1f1f1f`), 1px solid `{colors.hairline}` | Task cards, node cards, toolbars |
| **2 — Inset Panel** | Background `{colors.surface-muted}` (`#181b26`), 1px solid `{colors.hairline-subtle}` | XTerm terminal containers, code editor views |
| **3 — Modal Window** | Background `{colors.surface-card}`, 2px solid `{colors.primary}` | MCP Assistant modal, Task creation dialogs |

---

## Shapes & Geometry

### Border Radius Scale
| Token | Value | Application |
| :--- | :--- | :--- |
| `{rounded.none}` | **0px** | ALL buttons, task cards, DAG nodes, terminal panels, input fields, modals |
| `{rounded.full}` | **9999px** | Status indicator dots, active execution pulse rings |

The UI enforces strict **0px angular geometry**. No rounded corners are allowed on structural cards, buttons, or input controls.

---

## Components

### 1. Buttons

**`button-primary`**
- Background `{colors.primary}` (`#e1f4f3`), text `{colors.on-primary}` (`#0d0d0d`), type `{typography.button-md}`, padding `10px 20px`, height `40px`, rounded `{rounded.none}`.
- Used for main execution triggers ("Run Workflow", "Install MCP CLI").

**`button-outline`**
- Background transparent, text `{colors.ink}`, border 1px solid `{colors.hairline}`, type `{typography.button-md}`, padding `10px 18px`, height `40px`, rounded `{rounded.none}`.
- Used for secondary workspace actions ("Import YAML", "Export YAML", "Stop Execution").

**`button-ghost`**
- Background transparent, text `{colors.primary}`, type `{typography.button-md}`, rounded `{rounded.none}`.
- Used for inline action links and tab triggers.

---

### 2. Task Cards & DAG Nodes

**`task-card`**
- Container: Background `{colors.surface-card}` (`#1f1f1f`), border 1px solid `{colors.hairline}` (`#BFBFBF`), padding `20px`, rounded `{rounded.none}`.
- Content: Task name, shell command, folder path, dependency badge list, action triggers.

**`dag-node`** (ReactFlow Custom Node)
- Container: Background `{colors.surface-card}`, border 1px solid `{colors.hairline}`, padding `14px`, rounded `{rounded.none}`.
- Status Indicator: Green checkmark for `SUCCESS`, pulsing cyan ring for `RUNNING`, gray clock for `IDLE`.

---

### 3. Terminal & Console

**`terminal-panel`**
- Container: Background `{colors.surface-dark}` (`#0d0d0d`), border 1px solid `{colors.hairline-subtle}`, padding `16px`, rounded `{rounded.none}`.
- Font: `{typography.code-mono}` (JetBrains Mono).
- Features: Integrated `@xterm/xterm` with `@xterm/addon-fit` and ANSI color stream parsing.

---

### 4. Navigation & Workspace Header

**`nav-header`**
- Background `{colors.surface-card}` (`#1f1f1f`), height `56px`, border bottom 1px solid `{colors.hairline}`.
- Houses logo, workspace path dropdown, route tabs (`/`, `/tasks`, `/execution`, `/analysis`, `/report`), and MCP status badge.

---

## Do's and Don'ts

### Do
- Keep all interactive elements under `{rounded.none}` (0px) sharp corners.
- Use `{colors.primary}` (`#e1f4f3`) and `{colors.emerald-accent}` (`#10b981`) exclusively for active controls, running states, and execution highlights.
- Keep structural dividers to 1px solid `{colors.hairline}` (`#BFBFBF`).
- Frame terminal outputs inside `{colors.surface-dark}` canvas panels with JetBrains Mono typography.

### Don't
- Don't use rounded pill buttons or soft drop shadows on card containers.
- Don't add decorative background blur or atmospheric gradient overlays inside the desktop UI.
- Don't introduce non-standard accent colors; strictly adhere to the mint, emerald, cyan, teal, and violet token roles.
- Don't alter the 56px header or 240px sidebar layout geometry.

---

## Known Gaps & Limitations

- **Light Mode**: Orchestra desktop UI strictly operates in dark mode (`#0d0d0d`); no light mode theme is provided by design.
- **High DPI Scaling**: Terminal canvas height dynamically scales using `@xterm/addon-fit` on window resize events.
