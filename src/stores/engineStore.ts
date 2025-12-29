import * as THREE from 'three';
import { create } from 'zustand';

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'legendary';

interface InputState {
    direction: { x: number; y: number };
    active: boolean;
    jump: boolean;
}

interface PlayerState {
    position: THREE.Vector3;
    rotation: number;
    speed: number;
    maxSpeed: number;
    verticalSpeed: number;
    isMoving: boolean;
    isJumping: boolean;
    speedMultiplier: number;
}

interface RockData {
    position: THREE.Vector3;
    scale: THREE.Vector3;
    rotation: THREE.Euler;
    radius: number; // Simplified collision radius
}

interface NearbyResource {
    name: string;
    icon: string;
    type: string;
}

export type GameMode = 'exploration' | 'boss_battle' | 'racing' | 'examples';

interface GameState {
    loaded: boolean;
    time: number;
    difficulty: DifficultyLevel;
    mode: GameMode;
    input: InputState;
    player: PlayerState;
    rocks: RockData[];
    gameOver: boolean;
    activeBossId: number | null;
    nearbyResource: NearbyResource | null;
    score: number;
    distance: number;

    // Actions
    setLoaded: (loaded: boolean) => void;
    updateTime: (delta: number) => void;
    setDifficulty: (difficulty: DifficultyLevel) => void;
    setMode: (mode: GameMode) => void;
    setInput: (x: number, y: number, active: boolean, jump: boolean) => void;
    updatePlayer: (updates: Partial<PlayerState>) => void;
    setRocks: (rocks: RockData[]) => void;
    setGameOver: (gameOver: boolean) => void;
    setActiveBossId: (id: number | null) => void;
    setNearbyResource: (resource: NearbyResource | null) => void;
    addScore: (amount: number) => void;
    setDistance: (distance: number) => void;
    respawn: () => void;
}

export const useEngineStore = create<GameState>((set) => ({
    loaded: false,
    time: 0,
    difficulty: 'normal',
    mode: 'exploration',
    input: { direction: { x: 0, y: 0 }, active: false, jump: false },
    player: {
        position: new THREE.Vector3(0, 0, 0),
        rotation: 0,
        speed: 0,
        maxSpeed: 0.15,
        verticalSpeed: 0,
        isMoving: false,
        isJumping: false,
        speedMultiplier: 1.0,
    },
    rocks: [],
    gameOver: false,
    activeBossId: null,
    nearbyResource: null,
    score: 0,
    distance: 0,

    setLoaded: (loaded) => set({ loaded }),
    updateTime: (delta) => set((state) => ({ time: state.time + delta })),
    setDifficulty: (difficulty) => set({ difficulty }),
    setMode: (mode) => set({ mode }),
    setInput: (x, y, active, jump) => set({ input: { direction: { x, y }, active, jump } }),
    updatePlayer: (updates) => set((state) => ({
        player: { ...state.player, ...updates },
    })),
    setRocks: (rocks) => set({ rocks }),
    setGameOver: (gameOver) => set({ gameOver }),
    setActiveBossId: (id) => set({ activeBossId: id }),
    setNearbyResource: (resource) => set({ nearbyResource: resource }),
    addScore: (amount) => set((state) => ({ score: state.score + amount })),
    setDistance: (distance) => set({ distance }),
    respawn: () => set((state) => ({
        player: {
            ...state.player,
            position: new THREE.Vector3(0, 0, 0),
            verticalSpeed: 0,
            isJumping: false,
        },
        gameOver: false,
        score: 0,
        distance: 0,
        mode: 'exploration',
    })),
}));

// Alias useGameState to useEngineStore for Strata pattern compatibility
export const useGameState = useEngineStore;
