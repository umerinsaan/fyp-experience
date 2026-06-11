# FYP Experience — Presenter Summary

**"Below the Surface"** — a scroll-driven briefing site for the FYP project. It explains the product; it is **not** the live platform (no backend, no real scans).

---

## What the project is about

- **Full title:** Smart Agent Based Platform for Penetration Testing
- **Team:** CS-22057 (Rayyan Mirza, Muhammad Umer, Faiq-uz-Zaman, Hashir Rahman Khan)
- **Core idea:** One place to plan, run, and report security testing — instead of juggling many separate tools
- **Human stays in charge:** The platform removes repetitive glue work; the pentester's judgment stays human

---

## The real product (what this site is selling)

- **Web console (FYP.UI):** Where analysts create engagements, design workflows, and read results
- **Cloud backend (FYP.Backend):** API, database, job queue, live updates
- **Edge agent (Agent):** Runs approved scans **inside** the customer network and sends results **outbound only** (no inbound ports)
- **Flow in one sentence:** Console → API → queue → dispatcher → secure channel → agent → storage → ingestion → live feed back to console

---

## What this website actually is

- A **cinematic presentation** built with React, 3D (Three.js), and scroll-synced animations
- One long scroll = one "film" from problem → solution → architecture → features → future work
- **Desktop / projector first** (1280px+); built for viva and demos, not phones
- Uses **screenshots** of the real console plus **3D scenes** to explain ideas visually
- Short **session boot loader** on first visit (skippable with Esc)

---

## Story flow (chapters to walk through)

| Chapter | What to say in plain terms |
|--------|----------------------------|
| **Prologue** | "This is our platform briefing." |
| **The Problem** | Pentesters use too many disconnected tools; outputs don't match (XML, JSON, CSV); reports are manual. |
| **The Cost** | Same painful steps repeat for every client, subnet, and quarter. |
| **Our Objective** | Unify the workflow — jobs, pipelines, mapping, remediation, reports — without replacing the analyst. |
| **Architecture** | **Main climax:** 3D diagram of cloud + edge — how work travels from console to agent and back. |
| **Technologies** | Stack walkthrough (Angular, .NET, Python agent, SignalR, Redis, MinIO, Keycloak, etc.). |
| **Six key features** | Jobs engine · Pipeline designer · Suggested next steps · Live RBAC · Report library · Security dashboard. |
| **Future Work** | AI guidance, stronger tenant crypto, zero trust, maturity in reports, cloud/host agents. |

---

## Six features — one line each

- **Jobs engine:** Any tool described by JSON schema → validated → safe command → dispatched to agent
- **Pipeline designer:** Draw scan workflows as a graph (parallel forks, joins) — no custom code
- **Suggested next steps:** Rule-based hints ("what to run next") — readable rules, not a black box
- **Live RBAC:** See and edit who can do what, highlighted on the real UI
- **Report library:** Generate PDFs once; whole team reads from the same library
- **Security posture dashboard:** Assets view vs vulnerabilities view on the same data

---

## How to present it (practical tips)

- Run at **1280px+** on a laptop or projector; turn **Sound on** before you start
- **Scroll** through the story, or use the **chapter rail on the left** to jump to any section
- **Keyboard shortcuts:** `?` = cheat sheet · `Alt+1`–`Alt+5` = demo bookmarks (architecture wide, agent channel, workflow ring, etc.)
- **Suggested live path:** Problem → Objective → **Alt+1** (full architecture) → **Alt+2** (secure channel) → **Alt+3**–**Alt+4** (workflow + agent) → Impact / Future Work
- **Start dev:** `npm run dev` → http://localhost:5174
- **Viva build:** `npm run preview:viva` (lighter 3D if the machine struggles)
- Before presenting: boot completes, console shows `[fyp-viva] Ship check passed`, scroll once without a crash

---

## One sentence for the opening

> "We built a smart, agent-based platform that connects penetration testing tools into one job-driven workflow — cloud plans the work, edge agents run it safely inside the network, and results flow back live for reporting and posture tracking."
