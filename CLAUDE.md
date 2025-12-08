# CLAUDE.md

This file provides guidance to Claude Code when working with Rivermarsh.

## Quick Reference

```bash
pnpm install        # Install deps
pnpm run dev        # Dev server
pnpm run build      # Production build
pnpm run test       # Run tests
```

## Overview

Rivermarsh is a mobile-first 3D exploration game built with:
- React Three Fiber for 3D rendering
- Capacitor for mobile builds
- Miniplex ECS architecture
- Zustand state management

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/` | Main application code |
| `src/ecs/` | Entity Component System |
| `src/components/` | React/R3F components |
| `.crewai/` | AI crew configs (pending integration) |
| `.kiro/` | Kiro agent settings |

## Pending

- agentic-crew integration for AI-assisted development
- strata integration for procedural effects
