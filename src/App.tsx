import { FollowCamera } from '@/components/Camera';
import { NPCs } from '@/components/NPCs';
import { Player } from '@/components/Player';
import { Resources } from '@/components/Resources';
import { TapToCollect } from '@/components/TapToCollect';
import { GameOver } from '@/components/ui/GameOver';
import { HUD } from '@/components/ui/HUD';
import { Loader } from '@/components/ui/Loader';
import { Tutorial } from '@/components/ui/Tutorial';
import { World } from '@/components/World';
import { VolumetricEffects } from '@/components/VolumetricEffects';
import { GameSystems } from '@/systems/GameSystems';
import { InputZone, useInput } from '@/systems/input';
import { initTestHooks, setGameReady } from '@/utils/testHooks';
import { Canvas } from '@react-three/fiber';
// Post-processing effects are handled by Strata's VolumetricEffects
// import { Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { useEffect } from 'react';

// Initialize test hooks for E2E testing
initTestHooks();

function Scene() {
    useInput();

    // Mark game as ready after first frame
    useEffect(() => {
        const timer = setTimeout(() => setGameReady(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <GameSystems />
            
            {/* Physics world wraps all physical objects */}
            <Physics gravity={[0, -15, 0]} timeStep="vary">
                <World />
                <Player />
                <NPCs />
                <Resources />
            </Physics>
            
            <FollowCamera />
            <TapToCollect />

            {/* Volumetric effects for fog and underwater */}
            <VolumetricEffects
                enableFog={true}
                enableUnderwater={true}
                fogSettings={{
                    color: new THREE.Color(0.6, 0.7, 0.8),
                    density: 0.015,
                    height: 5
                }}
                underwaterSettings={{
                    color: new THREE.Color(0.0, 0.25, 0.4),
                    density: 0.08,
                    causticStrength: 0.4,
                    waterSurface: 0
                }}
            />
        </>
    );
}

export default function App() {
    return (
        <>
            <Canvas
                shadows
                camera={{ fov: 50, near: 0.1, far: 500, position: [0, 3.5, -5] }}
                gl={{
                    antialias: false,
                    powerPreference: 'high-performance',
                }}
                dpr={[1, 1.5]}
                style={{ background: '#0a0808' }}
            >
                <Scene />
            </Canvas>

            <InputZone />
            <HUD />
            <GameOver />
            <Loader />
            <Tutorial />
        </>
    );
}
