import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AchievementPopup } from '../../../../../src/components/ui/AchievementPopup';
import { useGameStore } from '../../../../../src/hooks/useGameStore';

// Mock the store to avoid complex dependency issues during testing if possible,
// but for integration test we want the real store logic.
// However, given the environment issues, maybe we should mock the hook?
// No, the test logic relies on the store behavior (queueing).

describe('AchievementPopup', () => {
  beforeEach(() => {
    useGameStore.setState({ achievementQueue: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render when queue is empty', () => {
    render(<AchievementPopup />);
    expect(screen.queryByTestId('achievement-popup')).toBeNull();
  });

  it('renders when an achievement is in the queue', async () => {
    render(<AchievementPopup />);

    act(() => {
      useGameStore.getState().pushAchievement('Test Achievement');
    });

    expect(screen.getByTestId('achievement-popup')).toBeInTheDocument();
    expect(screen.getByText('Test Achievement')).toBeInTheDocument();
  });

  it('removes achievement after timeout', async () => {
    render(<AchievementPopup />);

    act(() => {
      useGameStore.getState().pushAchievement('Test Achievement');
    });

    expect(screen.getByTestId('achievement-popup')).toBeInTheDocument();

    // Advance 3100ms
    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    const popup = screen.getByTestId('achievement-popup');
    // We expect it to be fading out (opacity-0 class added)
    // Note: implementation details might vary, but opacity-0 is what we added.
    expect(popup.className).toContain('opacity-0');

    // Advance 600ms
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.queryByTestId('achievement-popup')).toBeNull();
  });

  it('processes multiple achievements in sequence', async () => {
    render(<AchievementPopup />);

    act(() => {
      useGameStore.getState().pushAchievement('Achievement 1');
      useGameStore.getState().pushAchievement('Achievement 2');
    });

    expect(screen.getByText('Achievement 1')).toBeInTheDocument();

    // Complete the first achievement cycle
    await act(async () => {
      vi.advanceTimersByTime(3700);
    });

    // Check if second achievement is shown
    expect(screen.getByText('Achievement 2')).toBeInTheDocument();
  });
});
