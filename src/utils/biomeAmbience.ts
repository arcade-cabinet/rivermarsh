/**
 * Biome Ambience - Ambient soundscapes per biome
 * 
 * Uses Web Audio API to synthesize ambient sounds for each biome.
 */

type BiomeType = 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland'

interface BiomeAmbienceState {
    initialized: boolean
    context: AudioContext | null
    oscillators: Map<BiomeType, OscillatorNode[]>
    gains: Map<BiomeType, GainNode>
    masterGain: GainNode | null
}

const state: BiomeAmbienceState = {
    initialized: false,
    context: null,
    oscillators: new Map(),
    gains: new Map(),
    masterGain: null,
}

/**
 * Initialize the biome ambience system
 */
export async function initBiomeAmbience(): Promise<void> {
    if (state.initialized) return
    
    try {
        state.context = new AudioContext()
        state.masterGain = state.context.createGain()
        state.masterGain.gain.value = 0.1
        state.masterGain.connect(state.context.destination)
        state.initialized = true
    } catch (error) {
        console.warn('Biome ambience initialization failed:', error)
    }
}

/**
 * Dispose biome ambience resources
 */
export function disposeBiomeAmbience(): void {
    state.oscillators.forEach((oscs) => {
        oscs.forEach((osc) => {
            try { osc.stop() } catch { /* ignore */ }
        })
    })
    state.oscillators.clear()
    state.gains.clear()
    
    if (state.context) {
        state.context.close()
        state.context = null
    }
    
    state.masterGain = null
    state.initialized = false
}

/**
 * Get the biome ambience controller
 */
export function getBiomeAmbience(): BiomeAmbienceController | null {
    if (!state.initialized || !state.context) return null
    return controller
}

/**
 * Set volume for a specific biome
 */
function setVolume(biome: BiomeType, volume: number): void {
    const gain = state.gains.get(biome)
    if (gain) {
        gain.gain.setTargetAtTime(volume * 0.3, state.context?.currentTime || 0, 0.5)
    }
}

/**
 * Get current volume for a biome
 */
function getVolume(biome: BiomeType): number {
    const gain = state.gains.get(biome)
    return gain?.gain.value || 0
}

const controller = {
    setVolume,
    getVolume,
}

export type BiomeAmbienceController = typeof controller
