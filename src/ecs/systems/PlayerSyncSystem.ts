import { world } from '../world';
import { useRivermarsh } from '../../stores/useRivermarsh';

/**
 * PlayerSyncSystem - Syncs player ECS entity back to Zustand store
 * 
 * NOTE: The Store is the source of truth for player stats (health, stamina, position).
 * This system ensures the ECS entity reflects the Store state.
 */
export function PlayerSyncSystem() {
    for (const entity of world.with('isPlayer', 'species', 'transform')) {
        const stats = useRivermarsh.getState().player.stats;
        
        // Sync health FROM Store TO ECS
        // Store is source of truth for player health (updated by Shop, NPC attacks, etc.)
        if (entity.species!.health !== stats.health) {
            entity.species!.health = stats.health;
        }
        
        if (entity.species!.maxHealth !== stats.maxHealth) {
            entity.species!.maxHealth = stats.maxHealth;
        }

        // Sync stamina FROM Store TO ECS
        if (entity.species!.stamina !== stats.stamina) {
            entity.species!.stamina = stats.stamina;
        }

        if (entity.species!.maxStamina !== stats.maxStamina) {
            entity.species!.maxStamina = stats.maxStamina;
        }

        // Update ECS position from Zustand (since player is moved by Rapier/Zustand)
        const playerPos = useRivermarsh.getState().player.position;
        entity.transform!.position.set(playerPos[0], playerPos[1], playerPos[2]);
        
        // Update dead state if health is 0
        if (stats.health <= 0 && entity.species!.state !== 'dead') {
            entity.species!.state = 'dead';
        } else if (stats.health > 0 && entity.species!.state === 'dead') {
            entity.species!.state = 'idle';
        }
    }
}
