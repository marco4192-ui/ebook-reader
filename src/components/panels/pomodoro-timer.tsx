'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

import { formatTime } from '@/lib/reading/format';

export const PomodoroTimer = ({
  bookId,
  onSessionComplete,
}: {
  bookId: string;
  onSessionComplete?: (pomodorosCompleted: number) => void;
}) => {
  const { currentPomodoro, startPomodoroSession, updatePomodoroStatus, completePomodoro } = useBookStore();
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Default durations
  const workDuration = 25;
  const breakDuration = 5;

  useEffect(() => {
    if (!currentPomodoro || currentPomodoro.bookId !== bookId) {
      setTimeRemaining(workDuration * 60);
      setIsRunning(false);
      return;
    }

    const duration = currentPomodoro.status === 'work' 
      ? currentPomodoro.workDuration * 60 
      : currentPomodoro.breakDuration * 60;

    if (isRunning) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up
            if (currentPomodoro.status === 'work') {
              completePomodoro(currentPomodoro.id);
              setTimeRemaining(currentPomodoro.breakDuration * 60);
              onSessionComplete?.(currentPomodoro.completedPomodoros + 1);
              toast.success('Pomodoro abgeschlossen! Zeit für eine Pause.');
            } else {
              updatePomodoroStatus(currentPomodoro.id, 'work');
              setTimeRemaining(currentPomodoro.workDuration * 60);
              toast.info('Pause vorbei! Weiterlesen.');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRunning, currentPomodoro, bookId, completePomodoro, updatePomodoroStatus, onSessionComplete]);

  const startPomodoro = () => {
    if (!currentPomodoro || currentPomodoro.bookId !== bookId) {
      startPomodoroSession(bookId, workDuration, breakDuration);
    }
    setIsRunning(true);
  };

  const pausePomodoro = () => {
    setIsRunning(false);
  };

  const resetPomodoro = () => {
    setTimeRemaining(workDuration * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentPomodoro
    ? ((currentPomodoro.status === 'work' ? workDuration * 60 : breakDuration * 60) - timeRemaining) / 
      (currentPomodoro.status === 'work' ? workDuration * 60 : breakDuration * 60) * 100
    : 0;

  return (
    <Card className="p-3">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {currentPomodoro?.status === 'break' ? 'Pause' : 'Pomodoro'}
          </span>
        </div>
        
        <div className="relative w-20 h-20 mx-auto">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={226}
              strokeDashoffset={226 - (226 * progress) / 100}
              className={currentPomodoro?.status === 'break' ? 'text-green-500' : 'text-primary'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {isRunning ? (
            <Button size="sm" onClick={pausePomodoro}>
              <Pause className="w-4 h-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button size="sm" onClick={startPomodoro}>
              <Play className="w-4 h-4 mr-1" /> Start
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={resetPomodoro}>
            Reset
          </Button>
        </div>

        {currentPomodoro && (
          <p className="text-xs text-muted-foreground">
            {currentPomodoro.completedPomodoros} Pomodoros heute
          </p>
        )}
      </div>
    </Card>
  );
};
