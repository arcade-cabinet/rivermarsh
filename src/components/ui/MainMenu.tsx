import { useRPGStore } from '@/stores/rpgStore';
import { useEngineStore } from '@/stores/engineStore';
import { useEffect, useState } from 'react';

export function MainMenu() {
    const setGameMode = useRPGStore((s) => s.setGameMode);
    const [isVisible, setVisible] = useState(false);

    useEffect(() => {
        // Fade in effect
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleStart = () => {
        setVisible(false);
        setTimeout(() => {
            setGameMode('exploration');
        }, 500);
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, rgba(20, 20, 30, 0.8) 0%, rgba(5, 5, 10, 0.95) 100%)',
                zIndex: 2000,
                fontFamily: 'Cinzel, serif',
                color: '#fff',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
                pointerEvents: isVisible ? 'auto' : 'none',
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ 
                    fontSize: '72px', 
                    margin: 0, 
                    color: '#d4af37',
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                    letterSpacing: '8px'
                }}>
                    RIVERMARSH
                </h1>
                <p style={{ 
                    fontSize: '18px', 
                    color: '#aaa', 
                    letterSpacing: '4px',
                    marginTop: '10px'
                }}>
                    AN OTTER'S JOURNEY
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '250px' }}>
                <MenuButton onClick={handleStart} primary>Enter the Marsh</MenuButton>
                <MenuButton onClick={() => setGameMode('racing')}>River Racing</MenuButton>
                <MenuButton onClick={() => setGameMode('examples')}>Tutorials & Examples</MenuButton>
                <MenuButton onClick={() => {
                    if (confirm('Are you sure you want to reset your progress?')) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}>Reset Progress</MenuButton>
            </div>

            <div style={{ 
                position: 'absolute', 
                bottom: '40px', 
                fontSize: '12px', 
                color: '#555',
                letterSpacing: '1px'
            }}>
                &copy; 2025 ARCADE CABINET • POWERED BY STRATA
            </div>
        </div>
    );
}

function MenuButton({ children, onClick, primary = false }: { children: React.ReactNode, onClick: () => void, primary?: boolean }) {
    const [isHovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontFamily: 'Cinzel, serif',
                background: primary 
                    ? (isHovered ? '#e5c05b' : '#d4af37') 
                    : (isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent'),
                color: primary ? '#000' : (isHovered ? '#fff' : '#ccc'),
                border: primary ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textTransform: 'uppercase',
            }}
        >
            {children}
        </button>
    );
}
