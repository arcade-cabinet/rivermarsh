import * as THREE from 'three';
import { world } from '../world';
import { useRPGStore } from '@/stores';
import { combatEvents } from '../../events/combatEvents';

/**
 * SpellSystem - Manages spell lifecycle and effects
 */
export function SpellSystem(delta: number) {
    const now = Date.now();

    for (const entity of world.with('spell', 'isSpell')) {
        const { spell } = entity;

        // Check if spell is finished
        if (now - spell.startTime > spell.duration) {
            spell.isFinished = true;
            world.remove(entity);
            continue;
        }

        // Handle spell specific logic
        switch (spell.type) {
            case 'fireball':
                updateFireball(entity, delta);
                break;
            case 'heal':
                updateHeal(entity, delta);
                break;
            case 'shield':
                updateShield(entity, delta);
                break;
        }
    }
}

function updateFireball(entity: any, delta: number) {
    const { spell, transform } = entity;
    if (!transform || !spell.targetPosition) return;

    // Move fireball towards target
    const targetPos = new THREE.Vector3(spell.targetPosition.x, spell.targetPosition.y, spell.targetPosition.z);
    const direction = targetPos.clone().sub(transform.position).normalize();
    transform.position.add(direction.multiplyScalar(delta * 10));

    // Check for collision with target
    if (transform.position.distanceTo(targetPos) < 1.0) {
        // Hit!
        if (spell.targetId !== undefined) {
            const target = world.entities.find(e => e.id === spell.targetId);
            if (target && target.species) {
                const damage = 10 * spell.intensity;
                target.species.health = Math.max(0, target.species.health - damage);
                combatEvents.emitDamageEnemy(spell.targetId, damage, transform.position.clone());
            }
        }
        spell.isFinished = true;
        world.remove(entity);
    }
}

function updateHeal(_entity: any, _delta: number) {
    // Visuals handled by component
}

function updateShield(_entity: any, _delta: number) {
    // Visuals handled by component
}

/**
 * Casts a spell
 */
export function castSpell(type: 'fireball' | 'heal' | 'shield', casterId: number, targetId?: number, targetPosition?: THREE.Vector3) {
    const rpgStore = useRPGStore.getState();
    const manaCost = type === 'fireball' ? 5 : type === 'heal' ? 10 : 8;

    if (!rpgStore.useMana(manaCost)) {
        console.log('Not enough mana!');
        return false;
    }

    const caster = world.entities.find(e => e.id === casterId);
    const startPos = caster?.transform?.position.clone() || new THREE.Vector3();

    if (type === 'heal') {
        rpgStore.healPlayer(20);
        // Visual entity
        world.add({
            isSpell: true,
            isPlayer: true, // Attach to player for visuals
            transform: {
                position: startPos,
                rotation: new THREE.Quaternion(),
                scale: new THREE.Vector3(1, 1, 1),
            },
            spell: {
                type: 'heal',
                casterId,
                startTime: Date.now(),
                duration: 1000,
                intensity: 1,
                isFinished: false,
            }
        });
    } else if (type === 'fireball') {
        world.add({
            isSpell: true,
            transform: {
                position: startPos,
                rotation: new THREE.Quaternion(),
                scale: new THREE.Vector3(0.5, 0.5, 0.5),
            },
            spell: {
                type: 'fireball',
                casterId,
                targetId,
                targetPosition: targetPosition?.clone(),
                startTime: Date.now(),
                duration: 3000,
                intensity: 1.5,
                isFinished: false,
            }
        });
    }

    return true;
}
