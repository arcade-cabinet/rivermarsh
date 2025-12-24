import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { world } from '../../ecs/world';
import { performPlayerAttack, performPlayerSpell } from '../../ecs/systems/BossBattleSystem';

export const BossBattleUI: React.FC = () => {
    const { bossBattleActive, player } = useGameStore();
    const bossEntity = world.with('isBoss', 'boss').entities[0];

    useEffect(() => {
        if (!bossBattleActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'a') {
                performPlayerAttack();
            } else if (e.key.toLowerCase() === 's') {
                performPlayerSpell();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [bossBattleActive]);

    if (!bossBattleActive || !bossEntity || !bossEntity.boss) return null;

    const boss = bossEntity.boss;
    const bossHealthPercent = (boss.health / boss.maxHealth) * 100;

    return (
        <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '10px',
            color: 'white',
            textAlign: 'center',
            width: '400px',
            border: '2px solid #c62828',
            zIndex: 1000,
        }}>
            <h2>{boss.name}</h2>
            <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#333',
                borderRadius: '10px',
                overflow: 'hidden',
                margin: '10px 0',
            }}>
                <div style={{
                    width: `${bossHealthPercent}%`,
                    height: '100%',
                    backgroundColor: '#c62828',
                    transition: 'width 0.3s ease-out',
                }} />
            </div>
            <p>Boss HP: {boss.health} / {boss.maxHealth}</p>
            
            <div style={{ marginTop: '20px' }}>
                <p>Turn: {boss.turn === 'player' ? 'YOUR TURN' : 'BOSS TURN'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                    <div style={{ opacity: boss.turn === 'player' ? 1 : 0.5 }}>
                        <button 
                            onClick={performPlayerAttack}
                            disabled={boss.turn !== 'player'}
                            style={{ padding: '10px', cursor: 'pointer' }}
                        >
                            Attack (A)
                        </button>
                        <p>Dmg: 2-4 + {player.swordLevel}</p>
                    </div>
                    <div style={{ opacity: boss.turn === 'player' && boss.cooldown === 0 ? 1 : 0.5 }}>
                        <button 
                            onClick={performPlayerSpell}
                            disabled={boss.turn !== 'player' || boss.cooldown > 0 || player.mana < 3}
                            style={{ padding: '10px', cursor: 'pointer' }}
                        >
                            Spell (S)
                        </button>
                        <p>Dmg: 3-6 | Mana: 3</p>
                        {boss.cooldown > 0 && <p>Cooldown: {boss.cooldown} turns</p>}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '12px' }}>
                Mana: {player.mana} / {player.maxMana}
            </div>
        </div>
    );
};
