# Rivermarsh

A mobile-first 3D exploration game where you play as an otter navigating wetland ecosystems.

## Tech Stack

- **Framework**: React + Vite
- **3D Rendering**: React Three Fiber, Three.js
- **Mobile**: Capacitor (iOS/Android)
- **ECS**: Miniplex
- **State Management**: Zustand
- **Physics**: React Three Rapier
- **AI**: Yuka
- **Audio**: Tone.js

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm run test
```

## Mobile Development

```bash
# Sync with Android
pnpm run cap:sync:android

# Open in Android Studio
pnpm run cap:open:android
```

## Architecture

- `src/` - Main application code
- `src/components/` - React and R3F components
- `src/ecs/` - Entity Component System (Miniplex)
- `src/stores/` - Zustand state stores
- `src/systems/` - Game systems
- `.crewai/` - AI crew configurations

## Pending Integrations

- **[agentic-crew](https://github.com/jbcom/agentic-crew)**: Framework-agnostic AI crew orchestration
- **[strata](https://github.com/jbcom/strata)**: Procedural generation library for visual effects

## License

MIT
