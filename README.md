# FYP Experience

**Below the Surface** — bright sci-fi briefing site for the FYP internal security platform.

Fresh rebuild: React 19 · Vite · Framer Motion · React Three Fiber · Tailwind CSS 4.

**Theme:** bright vibrant sci-fi · **desktop/projector first** · skippable session boot loader.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5174
npm run build
npm run preview  # http://localhost:4174
```

## Stack

| Layer | Choice |
|-------|--------|
| UI | React 19 + TypeScript |
| Motion | Framer Motion |
| 3D | Three.js + React Three Fiber + Drei |
| Styling | Tailwind CSS 4 + design tokens |
| Routing | React Router 7 |

## Product repos

| Repo | Role |
|------|------|
| **FYP.UI** | Angular console |
| **FYP.Backend** | .NET API + worker |
| **Agent** | Python edge agent |

This repo is the presentation layer only — no backend, no live API.

## Design direction

See `.cursor/rules/remake-design-direction.mdc` — visibility, preloader, desktop-only, motion, 3D.

## Viva rehearsal (Pass 7)

Desktop/projector at **1280px+**. Enable **Sound** before presenting.

**Presenter shortcuts:** `?` cheat sheet · `Alt+1`–`Alt+5` demo bookmarks · **chapter rail** (left) jumps to any act.

**Suggested live flow:** scroll Prologue → Problem → Insight → **Alt+1** (architecture wide) → brief channel with **Alt+2** → **Alt+3** (workflow ring) → **Alt+4** (agent) → scroll Impact/Vision or **Alt+5**.

**If the viva laptop stutters:** set `VITE_VIVA_LITE=true` in `.env` and rebuild, or enable OS reduced motion (lighter particles, no DOF).

**Public deploy:** set `VITE_VIVA_CONTROLS=false` to hide demo HUD.

## Ship checklist (Pass 8)

**Production build for viva machine:**

```bash
npm run preview:viva   # build with VITE_VIVA_LITE + serve on :4174
```

**Before you present — verify:**

- [ ] Boot preloader completes (or Esc skip); toast **Ready for viva** appears
- [ ] DevTools console: `[fyp-viva] Ship check passed`
- [ ] Sound on; Impact and Vision each play **one** chime
- [ ] **Alt+1** architecture wide — full diagram, semantic streams + ecosystem particles readable on projector
- [ ] **Alt+2** Agent Channel — Secure Channel dock + mint streams visible
- [ ] Rail **double-click** Architecture → wide ecosystem jump
- [ ] Scroll full film once without WebGL crash

**Dress rehearsal order:** Problem (scroll) → Insight → **Alt+1** → **Alt+2** → **Alt+3** → **Alt+4** → Impact/Vision.

**After sign-off:** tag `viva-ready`, deploy `dist/` or run `preview:viva` on presentation laptop.
