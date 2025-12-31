import { ParticleEmitter } from '@jbcom/strata';
import { useFrame } from '@react-three/fiber';
import { useState } from 'react';
import { world } from '../../ecs/world';

/**
 * SpellEffects - Renders particle effects for active spells in the ECS
 */
export function SpellEffects() {
    const [spells, setSpells] = useState<any[]>([]);

    useFrame(() => {
        const activeSpells = world.with('spell', 'isSpell', 'transform').entities;
        if (activeSpells.length !== spells.length) {
            setSpells([...activeSpells]);
        }
    });

    return (
        <group>
            {spells.map((spellEntity) => (
                <SpellEffect key={spellEntity.id} entity={spellEntity} />
            ))}
        </group>
    );
}

function SpellEffect({ entity }: { entity: any }) {
    const { spell, transform } = entity;
    const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);

    useFrame(() => {
        if (transform) {
            setPosition([transform.position.x, transform.position.y, transform.position.z]);
        }
    });

    switch (spell.type) {
        case 'fireball':
            return (
                <group position={position}>
                    <ParticleEmitter
                        maxParticles={50}
                        emissionRate={100}
                        lifetime={0.5}
                        shape="sphere"
                        shapeParams={{ radius: 0.3 }}
                        velocity={[0, 0, 0]}
                        velocityVariance={[1, 1, 1]}
                        startColor="#ff4400"
                        endColor="#ffcc00"
                        startSize={0.2}
                        endSize={0.05}
                        startOpacity={1}
                        endOpacity={0}
                    />
                    <pointLight intensity={5} distance={5} color="#ff4400" />
                </group>
            );
        case 'heal':
            return (
                <group position={position}>
                    <ParticleEmitter
                        maxParticles={100}
                        emissionRate={200}
                        lifetime={1.0}
                        shape="sphere"
                        shapeParams={{ radius: 1.0 }}
                        velocity={[0, 2, 0]}
                        velocityVariance={[0.5, 1, 0.5]}
                        startColor="#44ff88"
                        endColor="#00ffcc"
                        startSize={0.1}
                        endSize={0.02}
                        startOpacity={0.8}
                        endOpacity={0}
                    />
                </group>
            );
        default:
            return null;
    }
}
