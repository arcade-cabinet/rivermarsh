import { world } from '../world';
import { useRivermarsh } from '../../stores/useRivermarsh';

/**
 * PlayerSyncSystem - Syncs player ECS entity back to Zustand store
 */
export function PlayerSyncSystem() {
    for (const entity of world.with('isPlayer', 'species', 'transform')) {
        const stats = useRivermarsh.getState().player.stats;
        
        // Sync health if it changed in ECS
        if (entity.species!.health !== stats.health) {
            const damage = stats.health - entity.species!.health;
            if (damage > 0) {
                useRivermarsh.getState().takeDamage(damage);
            } else if (damage < 0) {
                useRivermarsh.getState().heal(-damage);
            }
        }

        // Sync stamina if it changed in ECS
        if (entity.species!.stamina !== stats.stamina) {
            const consumed = stats.stamina - entity.species!.stamina;
            if (consumed > 0) {
                useRivermarsh.getState().useStamina(consumed);
            } else if (consumed < 0) {
                useRivermarsh.getState().restoreStamina(-consumed);
            }
        }

        // Update ECS position from Zustand (since player is moved by Rapier/Zustand)
        const playerPos = useRivermarsh.getState().player.position;
        entity.transform!.position.set(playerPos[0], playerPos[1], playerPos[2]);
    }
}
