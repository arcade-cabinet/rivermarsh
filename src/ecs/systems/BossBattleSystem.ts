import { world } from '../world';
import { useGameStore } from '../../stores/gameStore';
import { useRivermarsh } from '../../stores/useRivermarsh';
import { BOSSES } from '../data/bosses';

export function BossBattleSystem() {
    const { mode, activeBossId, updatePlayer, damagePlayer, addExperience, addGold, useMana, setMode, setActiveBossId } = useGameStore.getState();
    const { setGameMode } = useRivermarsh.getState();

    if (mode !== 'boss_battle' || activeBossId === null) return;

    const bossEntity = world.entities.find(e => e.id === activeBossId);
    if (!bossEntity || !bossEntity.boss || !bossEntity.species || !bossEntity.combat) {
        // If boss is gone or invalid, return to exploration
        setMode('exploration');
        setGameMode('exploration');
        setActiveBossId(null);
        return;
    }

    const { boss, species, combat } = bossEntity;
    const player = useGameStore.getState().player;

    // Handle turns
    if (combat.turn === 'player') {
        // Player turn is handled by input listeners in UI or a separate input handler
        // But we can check for cooldowns here if needed
    } else if (combat.turn === 'boss') {
        // Simple Boss AI logic
        if (combat.bossCooldown > 0) {
            combat.bossCooldown -= 1;
            return;
        }

        // Boss attacks
        const bossData = BOSSES[boss.type];
        let damage = 0;
        let actionName = 'Attack';

        if (boss.specialAbilityCooldown === 0) {
            // Use special ability
            const ability = bossData.abilities[0];
            damage = ability.damage;
            actionName = ability.name;
            boss.specialAbilityCooldown = 3; // 3 turn cooldown as per requirements
        } else {
            // Normal attack
            damage = Math.floor(Math.random() * 5) + 5;
            boss.specialAbilityCooldown = Math.max(0, boss.specialAbilityCooldown - 1);
        }

        console.log(`${bossData.name} uses ${actionName} for ${damage} damage!`);
        damagePlayer(damage);
        combat.lastAction = `${bossData.name} used ${actionName}`;
        combat.turn = 'player';
    }

    // Check for victory
    if (species.health <= 0) {
        console.log('Boss Defeated!');
        addExperience(boss.rewards.experience);
        addGold(boss.rewards.gold);
        
        // Remove boss entity
        world.remove(bossEntity);
        
        // Back to exploration
        setMode('exploration');
        setGameMode('exploration');
        setActiveBossId(null);
    }
}

// Function to handle player actions (called from UI)
export function handlePlayerAction(action: 'attack' | 'spell') {
    const { activeBossId, player, updatePlayer, useMana } = useGameStore.getState();
    if (activeBossId === null) return;

    const bossEntity = world.entities.find(e => e.id === activeBossId);
    if (!bossEntity || !bossEntity.species || !bossEntity.combat) return;

    const { species, combat } = bossEntity;
    if (combat.turn !== 'player') return;

    let damage = 0;
    let success = false;

    if (action === 'attack') {
        // Attack (A key): Random 2-4 damage + sword level
        damage = (Math.floor(Math.random() * 3) + 2) + player.level;
        success = true;
        combat.lastAction = `Player attacked for ${damage} damage`;
    } else if (action === 'spell') {
        // Spell (S key): Fireball 3-6 damage, costs 3 mana
        if (useMana(3)) {
            damage = (Math.floor(Math.random() * 4) + 3) + Math.floor(player.level / 2);
            success = true;
            combat.lastAction = `Player cast Fireball for ${damage} damage`;
        } else {
            console.log('Not enough mana!');
            return;
        }
    }

    if (success) {
        species.health = Math.max(0, species.health - damage);
        combat.turn = 'boss';
        combat.bossCooldown = 1; // Wait 1 "frame/tick" for boss turn
    }
}
