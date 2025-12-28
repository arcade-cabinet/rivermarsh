import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../hooks/useGameStore';

export function AchievementPopup() {
  const { achievementQueue, dismissAchievement } = useGameStore();
  const [visible, setVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<string | null>(null);

  const isProcessingRef = useRef(false);

  // Track all timers to clear on unmount
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const addTimer = (callback: () => void, delay: number) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      callback();
    }, delay);
    timersRef.current.add(id);
    return id;
  };

  useEffect(() => {
    // If we have items and are not processing one
    if (achievementQueue.length > 0 && !isProcessingRef.current) {
      const nextAchievement = achievementQueue[0];

      isProcessingRef.current = true;
      setCurrentAchievement(nextAchievement);

      // Use standard timeout for visual toggle to ensure it happens after render
      addTimer(() => setVisible(true), 10);

      // Hide after delay
      addTimer(() => {
        setVisible(false);
        // Wait for exit animation before removing from queue
        addTimer(() => {
          dismissAchievement();
          setCurrentAchievement(null);
          isProcessingRef.current = false;
        }, 500); // 500ms for exit animation
      }, 3000); // 3 seconds display time
    }
  }, [achievementQueue, dismissAchievement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all active timers
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
  }, []);

  if (!currentAchievement) return null;

  return (
    <div
      data-testid="achievement-popup"
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-500 transform ${
        visible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-8 opacity-0 scale-90'
      }`}
    >
      <div className="otter-panel px-6 py-4 flex items-center gap-4 bg-slate-900/90 border-2 border-yellow-500 shadow-xl shadow-yellow-500/20 rounded-xl min-w-[300px]">
        <div className="text-4xl animate-bounce">🏆</div>
        <div className="flex-1">
          <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">Achievement Unlocked!</div>
          <div className="text-white font-bold text-lg leading-tight">{currentAchievement}</div>
        </div>
      </div>
    </div>
  );
}
