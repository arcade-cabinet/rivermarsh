import { world } from '../world';
import { combatEvents } from '../../events/combatEvents';
import { useRivermarsh } from '../../stores/useRivermarsh';

/**
 * CombatSystem - Handles combat logic and hit detection
 */
let initialized = false;

export function CombatSystem() {
    if (initialized) return;

    // Subscribe to player attacks
    combatEvents.onPlayerAttack((position, range, damage) => {
        // Find all enemies in range
        const entities = world.with('isNPC', 'transform', 'species').entities;
        
        entities.forEach((entity) => {
            if (entity.species?.state === 'dead') return;

            const dist = entity.transform!.position.distanceTo(position);
            if (dist <= range) {
                // Damage NPC
                const npcId = entity.id?.toString() || '';
                if (npcId) {
                    useRivermarsh.getState().damageNPC(npcId, damage);
                    
                    // Update ECS health to match store
                    const updatedNPC = useRivermarsh.getState().npcs.find(n => n.id === npcId);
                    if (updatedNPC && entity.species) {
                        entity.species.health = updatedNPC.health ?? entity.species.health;
                    }
                    
                    // Emit damage event for visuals (floating numbers, particles)
                    combatEvents.emitDamageEnemy(npcId, damage, entity.transform!.position.clone());
                    
                    // Check if NPC died
                    if (updatedNPC && updatedNPC.health === 0) {
                        // Dead! 
                        entity.species!.state = 'dead';
                        // Add experience - scaled by NPC difficulty/type in future
                        useRivermarsh.getState().addExperience(25);
                        useRivermarsh.getState().addGold(10);
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
