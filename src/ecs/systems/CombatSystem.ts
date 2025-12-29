import { combatEvents } from '../../events/combatEvents';
import { useGameStore } from '../../stores/gameStore';
import { LEVELING } from '../../constants/game';
import { world } from '../world';

/**
 * CombatSystem - Handles combat logic and hit detection
 */
let initialized = false;

export function CombatSystem() {
    if (initialized) {
        return;
    }

    // Subscribe to player attacks
    combatEvents.onPlayerAttack((position, range, damage) => {
        // Find all enemies in range
        const entities = world.with('isNPC', 'transform', 'species').entities;

        entities.forEach((entity) => {
            if (entity.species?.state === 'dead') {
                return;
            }

            const dist = entity.transform!.position.distanceTo(position);
            if (dist <= range) {
                // Damage NPC
                const npcId = entity.id?.toString() || '';
                if (npcId) {
                    useGameStore.getState().damageNPC(npcId, damage);

                    // Emit damage event for visuals (floating numbers, particles)
                    combatEvents.emitDamageEnemy(npcId, damage, entity.transform!.position.clone());

                    // Check if NPC died
                    const updatedNPC = useGameStore
                        .getState()
                        .npcs.find((n: any) => n.id === npcId);
                    if (updatedNPC && (updatedNPC.health ?? 0) <= 0) {
                        // Dead!
                        entity.species!.state = 'dead';
                        // Add experience based on NPC type
                        const xpGain = entity.species!.type === 'predator' ? LEVELING.PREDATOR_XP : LEVELING.PREY_XP;
                        useGameStore.getState().addExperience(xpGain);
                        useGameStore.getState().addGold(10);
                    }
                }
            }
        });
    });

    initialized = true;
}

export function resetCombatSystem() {
    initialized = false;
}
