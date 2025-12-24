import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleEmitter } from '@jbcom/strata';
import { world } from '../../ecs/world';
import { useGameStore } from '../../stores/gameStore';

export const BossBattleEffects: React.FC = () => {
    const { bossBattleActive } = useGameStore();
    const [spellActive, setSpellActive] = useState(false);
    const [bossPosition, setBossPosition] = useState<[number, number, number]>([0, 0, 0]);

    useFrame(() => {
        if (!bossBattleActive) return;

        const bossEntity = world.with('isBoss', 'transform').entities[0];
        if (bossEntity && bossEntity.transform) {
            setBossPosition([
                bossEntity.transform.position.x,
                bossEntity.transform.position.y + 1, // Aim for the chest
                bossEntity.transform.position.z
            ]);
        }
    });

    // We can trigger this effect when the player casts a spell
    // For now, let's just show it when the boss's cooldown is set to 3 (just cast)
    useFrame(() => {
        const bossEntity = world.with('isBoss', 'boss').entities[0];
        if (bossEntity && bossEntity.boss) {
            const isCasting = bossEntity.boss.cooldown === 3 && bossEntity.boss.turn === 'boss';
            if (isCasting !== spellActive) {
                setSpellActive(isCasting);
            }
        }
    });

    if (!bossBattleActive || !spellActive) return null;

    return (
        <group position={bossPosition}>
            <ParticleEmitter
                maxParticles={50}
                emissionRate={100}
                lifetime={0.5}
                shape="sphere"
                shapeParams={{ radius: 0.5 }}
                velocity={[0, 2, 0]}
                velocityVariance={[1, 1, 1]}
                startColor="#ff4400"
                endColor="#ffcc00"
                startSize={0.5}
                endSize={0.1}
                startOpacity={1}
                endOpacity={0}
                blending={THREE.AdditiveBlending}
            />
            <pointLight intensity={2} color="#ff4400" distance={5} />
        </group>
    );
};
