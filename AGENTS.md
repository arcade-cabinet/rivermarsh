# Agent Instructions for Rivermarsh

## Overview

Rivermarsh is a mobile-first 3D exploration game where you play as an otter navigating wetland ecosystems. Built with React Three Fiber and Capacitor.

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm run test

# Android
pnpm run cap:sync:android
pnpm run cap:open:android
```

## Architecture

- `src/` - Main application (React + R3F)
- `src/ecs/` - Entity Component System (Miniplex)
- `src/components/` - React/R3F components
- `src/stores/` - Zustand state management
- `.crewai/` - AI crew configurations

## Pending Integrations

- **agentic-crew**: Framework-agnostic crew orchestration (Issue #1)
- **strata**: Procedural generation library (Issue #2)

## Commit Convention

Use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `refactor:` Code changes without behavior change
