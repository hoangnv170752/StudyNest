import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiPlay, mdiPause, mdiRestart, mdiChevronUp, mdiChevronDown } from '@mdi/js';
import './PomodoroTimer.css';

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

interface PomodoroTimerProps {
  className?: string;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ className }) => {
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedTime = localStorage.getItem('studynest_total_time');
    if (savedTime) {
      setTotalTimeSpent(parseInt(savedTime, 10));
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            playNotificationSound();
            return POMODORO_DURATION;
          }
          return prev - 1;
        });

        setTotalTimeSpent(prev => {
          const newTotal = prev + 1;
          localStorage.setItem('studynest_total_time', newTotal.toString());
          return newTotal;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLZiTYIGGi77OmfTRAMUKfj8LdjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpba8sZzKQUrgc7y2Yk2CBhpu+zpn00QDFCn4/C3YxwGOJLX8sx5LAUkd8fw3ZBBChRdtOvrqFUUCkaf4PK+bCEFMYfR89OCMwYebs==');
    audio.play().catch(() => {});
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(POMODORO_DURATION);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const progress = ((POMODORO_DURATION - timeLeft) / POMODORO_DURATION) * 100;

  if (!isExpanded) {
    return (
      <button
        className="timer-toggle-minimal"
        onClick={() => setIsExpanded(true)}
        title="Show timer"
      >
        <Icon path={mdiChevronDown} size={0.6} />
      </button>
    );
  }

  return (
    <div className={`pomodoro-timer ${className || ''}`}>
      <button
        className="timer-toggle"
        onClick={() => setIsExpanded(false)}
        title="Hide timer"
      >
        <Icon path={mdiChevronUp} size={0.8} />
      </button>

      <div className="timer-display">
        <div className="timer-circle" style={{ '--progress': `${progress}%` } as React.CSSProperties}>
          <span className="timer-text">{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      <div className="timer-controls">
        <button
          className="timer-button"
          onClick={handleStartPause}
          title={isRunning ? 'Pause' : 'Start'}
        >
          <Icon path={isRunning ? mdiPause : mdiPlay} size={0.8} />
        </button>
        <button
          className="timer-button"
          onClick={handleReset}
          title="Reset"
        >
          <Icon path={mdiRestart} size={0.8} />
        </button>
      </div>

      <div className="total-time">
        <span className="total-time-label">Total:</span>
        <span className="total-time-value">{formatTotalTime(totalTimeSpent)}</span>
      </div>
    </div>
  );
};

export default PomodoroTimer;
