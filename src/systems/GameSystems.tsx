import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useEngineStore } from '@/stores/engineStore';
import { getAdaptiveQualityManager } from '@/utils/adaptiveQuality';
import { getMemoryMonitor } from '@/utils/memoryMonitor';
import { AchievementSystem } from '../ecs/systems/AchievementSystem';
import { AISystem } from '../ecs/systems/AISystem';
import { BiomeSystem } from '../ecs/systems/BiomeSystem';
import { CollisionSystem } from '../ecs/systems/CollisionSystem';
import { CombatSystem } from '../ecs/systems/CombatSystem';
import { EnemyEffectsSystem } from '../ecs/systems/EnemyEffectsSystem';
import { PlayerSyncSystem } from '../ecs/systems/PlayerSyncSystem';
import { ResourceSystem } from '../ecs/systems/ResourceSystem';
import { SpawnSystem } from '../ecs/systems/SpawnSystem';
import { TimeSystem } from '../ecs/systems/TimeSystem';
import { WeatherSystem } from '../ecs/systems/WeatherSystem';
import { WorldEventSystem } from '../ecs/systems/WorldEventSystem';
import { BossBattleSystem } from '../ecs/systems/BossBattleSystem';
import { world } from '../ecs/world';
import { AudioSystem } from './AudioSystem';

export function GameSystems() {
    const qualityManager = useRef(getAdaptiveQualityManager());
    const memoryMonitor = useRef(getMemoryMonitor());
    const lastQualityCheck = useRef(0);
    const lastMemoryCheck = useRef(0);

    useFrame((_, delta) => {
        const state = useEngineStore.getState();
        const playerPos = state.player.position;
        
        // Sync difficulty from Zustand to ECS
        const currentDifficulty = state.difficulty;
        const worldEntity = world.with('difficulty').entities[0];
        if (worldEntity && worldEntity.difficulty.level !== currentDifficulty) {
            worldEntity.difficulty.level = currentDifficulty;
            // Update multipliers based on level
            const settings = {
                easy: { spawnRate: 0.7, damage: 0.5, health: 0.8, exp: 1.2 },
                normal: { spawnRate: 1.0, damage: 1.0, health: 1.0, exp: 1.0 },
                hard: { spawnRate: 1.3, damage: 1.5, health: 1.2, exp: 0.8 },
                legendary: { spawnRate: 1.6, damage: 2.5, health: 1.5, exp: 0.6 },
            }[currentDifficulty];

            worldEntity.difficulty.spawnRateMultiplier = settings.spawnRate;
            worldEntity.difficulty.damageMultiplier = settings.damage;
            worldEntity.difficulty.healthMultiplier = settings.health;
            worldEntity.difficulty.experienceMultiplier = settings.exp;

            console.log(`Difficulty changed to ${currentDifficulty}`, worldEntity.difficulty);
        }

        // Monitor frame time for adaptive quality
        const frameTimeMs = delta * 1000;
        qualityManager.current.recordFrameTime(frameTimeMs);

        // Check quality every 60 frames (~1 second)
        lastQualityCheck.current++;
        if (lastQualityCheck.current >= 60) {
            const changed = qualityManager.current.updateQuality();
            if (changed) {
                const settings = qualityManager.current.getSettings();
                console.log('Adaptive quality adjusted:', settings);
            }
            lastQualityCheck.current = 0;
        }

        // Check memory every 300 frames (~5 seconds)
        lastMemoryCheck.current++;
        if (lastMemoryCheck.current >= 300) {
            const gcTriggered = memoryMonitor.current.checkAndCleanup();
            if (gcTriggered) {
                console.log('Memory cleanup triggered');
            }
            lastMemoryCheck.current = 0;
        }

        // Run ECS systems in optimized order
        // 1. Environmental Systems
        TimeSystem(delta);
        WeatherSystem(delta);
        WorldEventSystem();

        // 2. State & Entity Management
        PlayerSyncSystem();
        BiomeSystem(playerPos.x, playerPos.z);
        SpawnSystem(playerPos);

        // 3. AI & Combat
        AISystem(delta);
        CombatSystem(); // Only initializes once

        // 4. Interaction & Physics Logic
        CollisionSystem(delta);
        ResourceSystem(playerPos, delta);

        // 5. Status Effects & Logic Resolution
        EnemyEffectsSystem(delta);
        AchievementSystem();
        BossBattleSystem();
    });

    return <AudioSystem />;
}
