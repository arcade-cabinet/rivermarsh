# Rivermarsh - Copilot Instructions

## Project Overview

Rivermarsh is a mobile-first 3D exploration game where you play as an otter navigating wetland ecosystems.

## Tech Stack

- **Framework**: React + Vite
- **3D**: React Three Fiber, Three.js
- **Mobile**: Capacitor (iOS/Android)
- **ECS**: Miniplex
- **State**: Zustand
- **Physics**: React Three Rapier
- **AI**: Yuka
- **Audio**: Tone.js
- **Procedural**: strata (pending)

## Architecture

- `src/` - Main application code
- `src/components/` - React/R3F components
- `src/ecs/` - Entity Component System
- `src/stores/` - Zustand state stores
- `.crewai/` - AI crew configurations (pending agentic-crew integration)

## Key Conventions

- Mobile-first design
- ECS for game entities
- Declarative 3D with R3F
- Component-based architecture
