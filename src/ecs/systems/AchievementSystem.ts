import { world } from '../world';
import { useAchievementStore } from '../../stores/useAchievementStore';
import { useGameStore } from '../../stores/gameStore';

let lastDayCount = 1;
const visitedBiomes = new Set<string>();

export function AchievementSystem(delta: number) {
    const { unlockAchievement } = useAchievementStore.getState();
    const gameStore = useGameStore.getState();

    // Survivor: Survive for a full day cycle
    for (const { time } of world.with('time')) {
        unlockAchievement('first-steps');
        
        if (time.dayCount > 1) {
            unlockAchievement('survivor');
        }
    }

    // Explorer: Discover three different biomes
    for (const { biome } of world.with('biome')) {
        visitedBiomes.add(biome.current);
        if (visitedBiomes.size >= 3) {
            unlockAchievement('explorer');
        }
    }

    // Master Scavenger: Collect 50 resources
    // This would ideally be tracked in a stats store.
    // For now we'll just leave the hook for other systems to call.

    // Bounty Hunter: Defeat your first predator
    // Checked in AISystem or combat logic.
}
