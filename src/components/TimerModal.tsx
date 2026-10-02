import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';
import { playWorkoutBeep } from '../utils/audio';

interface TimerModalProps {
  isOpen: boolean;
  initialSeconds: number;
  title: string;
  onClose: () => void;
  onFinished?: () => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  initialSeconds,
  title,
  onClose,
  onFinished,
}) => {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setRemaining(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds, isOpen]);

  useEffect(() => {
    if (!isRunning || !isOpen) return;

    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          playWorkoutBeep(3);
          onFinished?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isOpen, onFinished]);

  if (!isOpen) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = initialSeconds > 0 ? ((initialSeconds - remaining) / initialSeconds) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center w-72 max-w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
          <Timer className="w-4 h-4 text-sky-500" />
          <span>{title}</span>
        </div>

        {/* Big Counter */}
        <div className="relative py-2">
          <div className="text-5xl font-black font-mono tracking-wider bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">
            {timeStr}
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3 max-w-[180px] mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>إيقاف</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>بدء</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setRemaining(initialSeconds);
            }}
            title="إعادة التعيين"
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            title="إغلاق"
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
