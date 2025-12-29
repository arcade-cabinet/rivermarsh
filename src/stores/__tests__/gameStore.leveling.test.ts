import { describe, expect, it, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';
import { LEVELING, PLAYER } from '../../constants/game';
import * as THREE from 'three';

describe('GameStore Leveling', () => {
    beforeEach(() => {
        // Reset the store state manually to a clean level 1 state
        useGameStore.setState({
            player: {
                position: new THREE.Vector3(0, 1, 0),
                rotation: 0,
                speed: 0,
                maxSpeed: 0.15,
                verticalSpeed: 0,
                isMoving: false,
                isJumping: false,
                health: 100,
                maxHealth: 100,
                stamina: 100,
                maxStamina: 100,
                gold: 100,
                otterAffinity: 50,
                level: 1,
                experience: 0,
                expToNext: LEVELING.BASE_XP_REQUIRED,
                damage: PLAYER.BASE_DAMAGE,
                mana: 20,
                maxMana: 20,
                swordLevel: 0,
                shieldLevel: 0,
                bootsLevel: 0,
                skills: {} as any,
                inventory: [],
                equipped: {},
                activeQuests: [],
                completedQuests: [],
                factionReputation: {} as any,
                invulnerable: false,
                invulnerableUntil: 0,
            },
        } as any);
    });

    it('should initialize with correct leveling stats', () => {
        const { player } = useGameStore.getState();
        expect(player.level).toBe(1);
        expect(player.experience).toBe(0);
        expect(player.expToNext).toBe(LEVELING.BASE_XP_REQUIRED);
    });

    it('should gain experience', () => {
        const { addExperience } = useGameStore.getState();
        addExperience(50);
        const { player } = useGameStore.getState();
        expect(player.experience).toBe(50);
        expect(player.level).toBe(1);
    });

    it('should level up when reaching experience threshold', () => {
        const { addExperience } = useGameStore.getState();
        const initialMaxHealth = useGameStore.getState().player.maxHealth;
        
        // Gain enough XP to level up
        addExperience(LEVELING.BASE_XP_REQUIRED);
        
        const { player } = useGameStore.getState();
        expect(player.level).toBe(2);
        expect(player.experience).toBe(0);
        expect(player.expToNext).toBe(Math.floor(LEVELING.BASE_XP_REQUIRED * LEVELING.XP_MULTIPLIER));
        expect(player.maxHealth).toBe(initialMaxHealth + PLAYER.HEALTH_PER_LEVEL);
        expect(player.health).toBe(player.maxHealth); // Healed on level up
        expect(player.damage).toBe(PLAYER.BASE_DAMAGE + PLAYER.DAMAGE_PER_LEVEL);
    });

    it('should handle multiple level ups at once', () => {
        const { addExperience } = useGameStore.getState();
        
        // Gain massive XP
        addExperience(1000);
        
        const { player } = useGameStore.getState();
        expect(player.level).toBeGreaterThan(2);
        expect(player.maxHealth).toBe(PLAYER.INITIAL_HEALTH + (player.level - 1) * PLAYER.HEALTH_PER_LEVEL);
    });

    it('should respect the max level cap', () => {
        const { addExperience } = useGameStore.getState();
        
        // Set player to near max level
        useGameStore.setState((state) => ({
            player: {
                ...state.player,
                level: LEVELING.MAX_LEVEL,
                experience: 0,
                expToNext: 1000,
            }
        } as any));
        
        addExperience(2000);
        
        const { player } = useGameStore.getState();
        expect(player.level).toBe(LEVELING.MAX_LEVEL);
        // Verify excess XP is handled properly (capped at expToNext - 1)
        expect(player.experience).toBe(player.expToNext - 1);
    });
});
