/**
 * VolumetricEffects Component - Using @jbcom/strata
 *
 * Wrapper around Strata's VolumetricEffects for post-processing
 * with fog and underwater effects.
 */

import { VolumetricEffects as StrataVolumetricEffects } from '@jbcom/strata';
import type * as THREE from 'three';

interface FogSettings {
    color?: THREE.ColorRepresentation;
    density?: number;
    height?: number;
}

interface UnderwaterSettings {
    color?: THREE.ColorRepresentation;
    density?: number;
    causticStrength?: number;
    waterSurface?: number;
}

interface VolumetricEffectsProps {
    enableFog?: boolean;
    enableUnderwater?: boolean;
    fogSettings?: FogSettings;
    underwaterSettings?: UnderwaterSettings;
}

/**
 * VolumetricEffects wrapper component
 * Provides fog and underwater post-processing effects using Strata
 */
export function VolumetricEffects({
    enableFog = true,
    enableUnderwater = false,
    fogSettings,
    underwaterSettings,
}: VolumetricEffectsProps) {
    return (
        <StrataVolumetricEffects
            enableFog={enableFog}
            enableUnderwater={enableUnderwater}
            fogSettings={fogSettings}
            underwaterSettings={underwaterSettings}
        />
    );
}
