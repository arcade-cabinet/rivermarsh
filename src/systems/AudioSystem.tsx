import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { getBiomeAtPosition } from '@/ecs/data/biomes';
import { getBiomeLayout } from '@/ecs/systems/BiomeSystem';
import { world as ecsWorld } from '@/ecs/world';
import { useEngineStore } from '@/stores/engineStore';
import { disposeAudioManager, getAudioManager, initAudioManager } from '@/utils/audioManager';
import { disposeBiomeAmbience, getBiomeAmbience, initBiomeAmbience } from '@/utils/biomeAmbience';
import {
    disposeEnvironmentalAudio,
    getEnvironmentalAudio,
    initEnvironmentalAudio,
} from '@/utils/environmentalAudio';
import { AmbientAudio, FootstepAudio, WeatherAudio } from '@jbcom/strata';

type InitState = 'idle' | 'initializing' | 'initialized';

/**
 * AudioSystem - Manages game audio including footsteps and biome ambient sounds
 */
export function AudioSystem() {
    const { camera } = useThree();
    const currentBiome = useRef<string>('marsh');
    const currentWeather = useRef<string>('clear');
    const lastFootstepTime = useRef<number>(0);
    const lastThunderTime = useRef<number>(0);
    const initState = useRef<InitState>('idle');

    // Initialize audio manager, environmental audio, and biome ambience once
    useEffect(() => {
        // Atomic check-and-set to prevent race conditions
        if (initState.current !== 'idle') {
            return;
        }
        initState.current = 'initializing';

        let mounted = true;

        const initializeAudio = async () => {
            try {
                // Initialize synchronous audio manager first
                initAudioManager(camera);

                // Initialize async audio systems
                await Promise.all([initEnvironmentalAudio(), initBiomeAmbience()]);

                // Only mark as initialized if component is still mounted
                if (mounted) {
                    initState.current = 'initialized';
                }
            } catch (error) {
                console.error('Failed to initialize audio systems:', error);
                // Reset state to allow retry on remount
                if (mounted) {
                    initState.current = 'idle';
                }
            }
        };

        initializeAudio();

        // Cleanup function to dispose audio resources on unmount
        return () => {
            mounted = false;
            // Only dispose if we were fully initialized
            if (initState.current === 'initialized') {
                disposeAudioManager();
                disposeEnvironmentalAudio();
                disposeBiomeAmbience();
            }
            initState.current = 'idle';
        };
    }, [camera]);

    const playerPos = useEngineStore((s) => s.player.position);
    const isMoving = useEngineStore((s) => s.player.isMoving);
    const isJumping = useEngineStore((s) => s.player.isJumping);
    const playerSpeed = useEngineStore((s) => s.player.speed);
    const playerMaxSpeed = useEngineStore((s) => s.player.maxSpeed);

    // Update current biome and weather from ECS
    useEffect(() => {
        const interval = setInterval(() => {
            const weatherEntity = ecsWorld.with('weather').entities[0];
            if (weatherEntity?.weather) {
                currentWeather.current = weatherEntity.weather.current;
            }
            const biomeEntity = ecsWorld.with('biome').entities[0];
            if (biomeEntity?.biome) {
                currentBiome.current = biomeEntity.biome.current;
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <FootstepAudio
                position={playerPos}
                isMoving={isMoving && !isJumping}
                speed={playerSpeed / playerMaxSpeed}
                terrainType={
                    playerPos.y < 0.2
                        ? 'water'
                        : getBiomeAtPosition(playerPos.x, playerPos.z, getBiomeLayout()) === 'tundra'
                          ? 'snow'
                          : ['mountain', 'desert'].includes(
                                  getBiomeAtPosition(playerPos.x, playerPos.z, getBiomeLayout())
                              )
                            ? 'rock'
                            : 'grass'
                }
            />
            <AmbientAudio biome={currentBiome.current as any} />
            <WeatherAudio
                weather={currentWeather.current as any}
                intensity={
                    ecsWorld.with('weather').entities[0]?.weather?.intensity ?? 0
                }
            />
        </>
    );
}
