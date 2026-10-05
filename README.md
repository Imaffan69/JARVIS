# JARVIS — Private Distributed Personal AI Operating System

> One intelligent assistant, backed by a distributed computer.

JARVIS is a private, local-first, multi-device, multi-agent personal AI operating system. The user talks to
**one identity**; underneath, an orchestrator plans, routes work across nodes, runs specialized agents and keeps
every secret on hardware the owner controls.

This repository currently implements **Phase 1: the Control Center** — the web surface where the entire plan's
data model is made real and observable.

## What's implemented (Phase 1 — Control Center)

A themed, dark futuristic React + Vite + TypeScript app.

**Landing (`/`)** — private futuristic interface with hero, capabilities, resource pool, AI/model router,
Privacy Gateway, security and a clear path into the owner account flow.

**Auth (`/auth`)** — owner-account creation / sign-in. Preserves `returnTo` and always falls back to the
authenticated destination (`/app`), never the public landing page.

**Control center (`/app`, protected):**

| Route | Plan section | What it does |
| --- | --- | --- |
| `/app` Command | §139, §77–§79 | Resource gauges, agent activity, event bus, task queue, model router, quick command dispatch |
| `/app/chat` | §39, §41, §114 | One identity, topic-isolated context, voice input, agent/task cards |
| `/app/tasks` | §14–§18, §117–§120 | Task board with pause / resume / cancel / migrate, priority, data class, checkpoints |
| `/app/agents` | §8–§13, §118 | Specialist registry, sandboxed permissions, progress, node/model assignment |
| `/app/devices` | §3–§5, §64–§65, §94 | Node metrics (live), capabilities, per-node modes, heartbeat, trust & pairing |
| `/app/models` | §26–§29, §104–§107 | Model registry, owner-approved installs, load/unload, privacy class, capability scores |
| `/app/memory` | §37–§40 | Memory types with approval workflow, proposed habits, knowledge graph |
| `/app/projects` | §73–§74, §134 | Projects, shared workspace, agent teams |
| `/app/notifications` | §47, §97 | Priority + policy actions (READ / IGNORE / SUMMARIZE / ANNOUNCE / REMIND / STORE) |
| `/app/privacy` | §32–§35, §135 | Privacy Gateway log, data classification, blocked external requests |
| `/app/activity` | §68–§69, §126 | Audit log (no secrets) + realtime event bus + security monitor |
| `/app/settings` | §22, §66, §104, §142–§144 | Identity, global modes, permissions, thresholds, danger zone |

### Live behaviour
- Nodes emit heartbeat metrics on a timer; overheating nodes auto-switch to `REST` (§21).
- Tasks and active agents advance progress; states transition toward completion.
- Global and per-node modes: `NORMAL / FAST / REST / SLEEP / FOCUS / QUIET / AWAY / HOME / ALERT` (§22).
- Commands like *"use all agents"*, *"only use local models"*, *"put system in REST"* dispatch through the
  orchestrator and activate agent teams (§110).
- State persists locally so identity, paired nodes and preferences survive reload.

## Non-negotiable principle

> JARVIS may be given broad **authorized** control over the owner's devices and applications, but it must never
> bypass OS security, application security, authentication, permission systems or other platform safeguards.

Every capability is gated by a granted permission, a risk level, an audit entry, and — for anything leaving the
system — the Privacy Gateway.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (custom JARVIS dark theme tokens) + a shadcn-style UI primitive set
- Framer Motion, Lucide icons
- Zustand (persisted) for the live domain store

## Scripts

```bash
bun install
bun run dev        # dev server (0.0.0.0)
bun run typecheck  # tsc -b --noEmit
bun run build      # static production output in dist/
```

## Roadmap (from the master plan)

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Core: auth, chat, permissions, memory, model provider | **Done (control center)** |
| 2 | Node runtime: registration, heartbeat, capabilities, health | Data model done · runtime next |
| 3 | Task engine: queue, pause/resume/cancel, migration, scheduler | UI done · durable engine next |
| 4 | Multi-agent: registry, teams, decomposition, shared workspace | UI done · execution engine next |
| 5 | Models: registry, local routing, health, approved downloads, fallback | Registry done · router next |
| 6 | Privacy: classifier, gateway, redaction, provider policy, audit | UI done · enforcement next |
| 7 | Voice: wake word, Whisper, VAD, Piper TTS, house coordination | Browser STT wired |
| 8 | Tools: filesystem, browser, terminal, email, GitHub, calendar | Planned |
| 9 | Android APK node | Planned |
| 10 | Windows (Tauri) node | Planned |
| 11 | Home Assistant, cameras, sensors, presence | Planned |
| 12 | Habit learning, knowledge graph, proactive actions | Partial (heuristics) |
| 13 | Hardening: security, recovery, backup, updates | Planned |
| 14 | Private production release | Planned |

The control center is the contract every later service must satisfy: the Node Protocol (§101), Agent Protocol
(§102), task checkpoints (§103) and the Privacy Gateway (§32) all have a UI representation here first.
