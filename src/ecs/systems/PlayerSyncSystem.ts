import { useRPGStore } from '../../stores/rpgStore';
import { useEngineStore } from '../../stores/engineStore';
import { world } from '../world';

/**
 * PlayerSyncSystem - Syncs player ECS entity back to Zustand store
 */
export function PlayerSyncSystem() {
    for (const entity of world.with('isPlayer', 'species', 'transform')) {
        const stats = useRPGStore.getState().player.stats;

        // Sync health if it changed in ECS
        if (entity.species!.health !== stats.health) {
            const diff = stats.health - entity.species!.health;
            if (diff > 0) {
                useRPGStore.getState().takeDamage(diff);
            } else if (diff < 0) {
                useRPGStore.getState().heal(-diff);
            }
        }

        // Sync stamina if it changed in ECS
        if (entity.species!.stamina !== stats.stamina) {
            const consumed = stats.stamina - entity.species!.stamina;
            if (consumed > 0) {
                useRPGStore.getState().useStamina(consumed);
            } else if (consumed < 0) {
                useRPGStore.getState().restoreStamina(-consumed);
            }
        }

        // Update ECS position from Engine Store (since player is moved by Rapier/Zustand)
        const playerPos = useEngineStore.getState().player.position;
        entity.transform!.position.copy(playerPos);
    }
}
