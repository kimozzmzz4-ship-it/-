import React, { useState, useEffect } from 'react';
import { AppState, FastingState } from '../types/fitness';
import { Timer, Play, Square, Award } from 'lucide-react';
import { playWorkoutBeep } from '../utils/audio';
import { fireConfetti } from '../utils/helpers';

interface FastingTabProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onToast: (msg: string) => void;
  onAddPts: (pts: number, reason: string) => void;
  onAddXP: (xp: number) => void;
}

export const FastingTab: React.FC<FastingTabProps> = ({
  state,
  onUpdateState,
  onToast,
  onAddPts,
  onAddXP,
}) => {
  const [, setTick] = useState(0);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fastModes: Array<{ id: FastingState['mode']; name: string; hours: number; desc: string }> = [
    { id: '16:8', name: '16:8', hours: 16, desc: 'النمط الأكثر شيوعاً وسهولة' },
    { id: '18:6', name: '18:6', hours: 18, desc: 'لتعزيز حرق الدهون المتقدم' },
    { id: '20:4', name: '20:4', hours: 20, desc: 'حمية المحارب (Warrior)' },
    { id: 'OMAD', name: 'OMAD', hours: 23, desc: 'وجبة واحدة باليوم (23 ساعة)' },
  ];

  const currentModeInfo = fastModes.find(m => m.id === state.fast.mode) || fastModes[0];
  const targetDurationMs = currentModeInfo.hours * 60 * 60 * 1000;

  let elapsedMs = 0;
  let remainingMs = targetDurationMs;
  let progressPct = 0;
  let isComplete = false;

  if (state.fast.startTime) {
    elapsedMs = Math.max(0, Date.now() - state.fast.startTime);
    remainingMs = Math.max(0, targetDurationMs - elapsedMs);
    progressPct = Math.min(100, (elapsedMs / targetDurationMs) * 100);
    isComplete = elapsedMs >= targetDurationMs;
  }

  // Format time strings
  const displayMs = state.fast.startTime ? (isComplete ? elapsedMs : remainingMs) : 0;
  const hours = Math.floor(displayMs / (1000 * 60 * 60));
  const minutes = Math.floor((displayMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((displayMs % (1000 * 60)) / 1000);
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleSelectMode = (mode: FastingState['mode']) => {
    onUpdateState(prev => ({
      ...prev,
      fast: {
        ...prev.fast,
        mode,
      },
    }));
    onToast(`⏱️ تم اختيار وضع الصيام ${mode}`);
  };

  const handleStartFast = () => {
    if (state.fast.startTime) {
      onToast('⚠️ مؤقت الصيام يعمل بالفعل');
      return;
    }
    const now = Date.now();
    onUpdateState(prev => ({
      ...prev,
      fast: {
        ...prev.fast,
        startTime: now,
      },
    }));
    onToast('⏱️ بدأ احتساب وقت الصيام! بالتوفيق يا بطل');
  };

  const handleStopFast = () => {
    if (!state.fast.startTime) {
      onToast('⚠️ لا يوجد مؤقت صيام قيد التشغيل حالياً');
      return;
    }

    const durationHours = (Date.now() - state.fast.startTime) / (1000 * 60 * 60);
    const earnedXp = Math.floor(durationHours * 5);
    const earnedPts = Math.floor(durationHours * 3);

    onUpdateState(prev => ({
      ...prev,
      fast: {
        ...prev.fast,
        startTime: null,
        sessions: prev.fast.sessions + 1,
        totalHours: prev.fast.totalHours + durationHours,
      },
      totals: {
        ...prev.totals,
        points: prev.totals.points + earnedPts,
        xp: prev.totals.xp + earnedXp,
      },
    }));

    playWorkoutBeep(2);
    if (durationHours >= currentModeInfo.hours) {
      fireConfetti();
      onToast(`🏆 أسطورة! أتممت صيام ${durationHours.toFixed(1)} ساعة (+${earnedXp} XP و +${earnedPts} ⭐)`);
    } else {
      onToast(`✅ تم إنهاء جلسة الصيام بنجاح: ${durationHours.toFixed(1)} ساعة (+${earnedXp} XP)`);
    }
  };

  // SVG Circle calculations (radius = 80, circumference = 2 * PI * 80 ≈ 502.65)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="space-y-3.5 pb-2">
      {/* Fasting Timer Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 mb-1">
          <Timer className="w-4 h-4 text-sky-500" />
          <span>مؤقت الصيام المتقطع الذكي</span>
        </h3>
        <p className="text-[11px] text-slate-400 mb-4">{currentModeInfo.desc}</p>

        {/* Circular SVG Timer */}
        <div className="relative w-48 h-48 mx-auto my-2 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
            {/* Background Circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="url(#fastingGradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="fastingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-slate-800 dark:text-white tracking-wider font-mono">
              {timeString}
            </span>
            <span className="text-[11px] font-bold mt-1 text-slate-500 dark:text-slate-400">
              {state.fast.startTime 
                ? (isComplete ? '🎉 اكتمل الصيام!' : `متبقي ${hours}h ${minutes}m`) 
                : 'جاهز للانطلاق'}
            </span>
            <span className="text-[10px] text-sky-500 font-extrabold mt-0.5">
              {Math.round(progressPct)}%
            </span>
          </div>
        </div>

        {/* Fasting Modes Switcher */}
        <div className="grid grid-cols-4 gap-2 my-4">
          {fastModes.map(m => (
            <button
              key={m.id}
              onClick={() => handleSelectMode(m.id)}
              className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                state.fast.mode === m.id
                  ? 'bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Start / Stop Controls */}
        <div className="flex gap-2">
          {!state.fast.startTime ? (
            <button
              onClick={handleStartFast}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>بدء جلسة الصيام</span>
            </button>
          ) : (
            <button
              onClick={handleStopFast}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-sm shadow-md shadow-rose-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>إنهاء وحفظ الجلسة</span>
            </button>
          )}
        </div>
      </div>

      {/* Fasting Statistics Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          <span>📊 إحصائيات الصيام التراكمية</span>
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <b className="text-xl font-black text-sky-500 block leading-tight">{state.fast.sessions}</b>
            <small className="text-[10px] text-slate-400 font-bold">جلسة صيام</small>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <b className="text-xl font-black text-teal-500 block leading-tight">{state.fast.sessions}</b>
            <small className="text-[10px] text-slate-400 font-bold">متتالية</small>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <b className="text-xl font-black text-purple-500 block leading-tight">
              {Math.round(state.fast.totalHours)}
            </b>
            <small className="text-[10px] text-slate-400 font-bold">ساعة إجمالية</small>
          </div>
        </div>
      </div>
    </div>
  );
};
