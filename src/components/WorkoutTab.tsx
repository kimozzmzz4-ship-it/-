import React from 'react';
import { AppState } from '../types/fitness';
import { PHASES, DAYS_ARABIC, WORKOUT_PATTERNS } from '../data/fitnessData';
import { todayKey } from '../utils/helpers';
import { Flame, RefreshCw, Timer as TimerIcon, Check, Info } from 'lucide-react';

interface WorkoutTabProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onOpenTimer: (seconds: number, title: string) => void;
  onToast: (msg: string) => void;
  onAddPts: (pts: number, reason: string) => void;
  onAddXP: (xp: number) => void;
}

export const WorkoutTab: React.FC<WorkoutTabProps> = ({
  state,
  onUpdateState,
  onOpenTimer,
  onToast,
  onAddPts,
  onAddXP,
}) => {
  const currentPhase = PHASES[state.phase] || PHASES[0];
  const dayIdx = state.day;
  const pat = WORKOUT_PATTERNS[state.days]?.[dayIdx];
  const currentSession = pat !== undefined && pat !== -1 ? currentPhase.sessions[pat % currentPhase.sessions.length] : null;
  const todayStr = todayKey();

  const handlePhaseChange = (phaseIdx: number) => {
    onUpdateState(prev => ({
      ...prev,
      phase: phaseIdx,
      week: 0,
    }));
  };

  const handleWeekChange = (weekIdx: number) => {
    onUpdateState(prev => ({
      ...prev,
      week: weekIdx,
    }));
  };

  const handleDayChange = (newDayIdx: number) => {
    onUpdateState(prev => ({
      ...prev,
      day: newDayIdx,
    }));
  };

  const handleSwapExercise = (k: string, altCount: number) => {
    onUpdateState(prev => ({
      ...prev,
      swaps: {
        ...prev.swaps,
        [k]: ((prev.swaps[k] || 0) + 1) % (altCount + 1),
      },
    }));
    onToast('🔄 تم تبديل التمرين إلى البديل المناسب');
  };

  const handleToggleExercise = (k: string, calories: number, totalInSession: number) => {
    const isAlreadyDone = !!state.done[k];

    onUpdateState(prev => {
      const nextDone = { ...prev.done };
      let nextExTotal = prev.totals.ex;
      let nextPoints = prev.totals.points;
      let nextXp = prev.totals.xp;
      const nextBonus = { ...prev.bonus };

      if (isAlreadyDone) {
        delete nextDone[k];
        nextExTotal = Math.max(0, nextExTotal - 1);
      } else {
        nextDone[k] = calories;
        nextExTotal += 1;
        nextPoints += 10;
        nextXp += 5;

        // Check if all exercises in this session today are done
        const sessionPrefix = `${todayStr}|${state.phase}-${state.week}-${state.day}-`;
        const completedInSession = Object.keys(nextDone).filter(dk => dk.startsWith(sessionPrefix)).length;

        if (completedInSession === totalInSession && !nextBonus[todayStr]) {
          nextBonus[todayStr] = 1;
          nextPoints += 50;
          nextXp += 50;
          onToast('🎉 مبروك! أتممت جلسة اليوم كاملة (+50 ⭐ بونص إضافي)');
        }
      }

      return {
        ...prev,
        done: nextDone,
        bonus: nextBonus,
        totals: {
          ...prev.totals,
          ex: nextExTotal,
          points: nextPoints,
          xp: nextXp,
        },
      };
    });

    if (!isAlreadyDone) {
      onToast(`💪 أحسنت! تمرين مكتمل (+10 ⭐ و +5 XP)`);
    }
  };

  return (
    <div className="space-y-3.5 pb-2">
      {/* Phase & Week Selection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span>🏋️ برنامج التدريب والمرحلة</span>
          </h3>
          <span className="text-[10px] text-sky-500 font-bold bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full">
            {state.days} أيام / أسبوع
          </span>
        </div>

        {/* Phase Select */}
        <select
          value={state.phase}
          onChange={(e) => handlePhaseChange(parseInt(e.target.value))}
          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          {PHASES.map((p, idx) => (
            <option key={idx} value={idx}>{p.title}</option>
          ))}
        </select>

        {/* Week Chips */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 mb-1.5">الأسبوع الحالي:</div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {currentPhase.weeks.map((w, idx) => (
              <button
                key={idx}
                onClick={() => handleWeekChange(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  state.week === idx
                    ? 'bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Day Chips */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 mb-1.5">يوم التمرين:</div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {DAYS_ARABIC.map((d, idx) => {
              const isTrainingDay = WORKOUT_PATTERNS[state.days]?.[idx] !== -1;
              const isSelected = state.day === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleDayChange(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{d}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isTrainingDay ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Session Exercise List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        {currentSession ? (
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>💪 {currentSession.t}</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {DAYS_ARABIC[state.day]} • {currentSession.ex.length} تمارين
                </span>
              </div>
              <button
                onClick={() => onOpenTimer(60, 'استراحة بين الجولات')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <TimerIcon className="w-3.5 h-3.5 text-sky-500" />
                <span>راحة 60 ث</span>
              </button>
            </div>

            <div className="divide-y divide-dashed divide-slate-100 dark:divide-slate-800">
              {currentSession.ex.map((e, idx) => {
                const k = `${todayStr}|${state.phase}-${state.week}-${state.day}-${idx}`;
                const isDone = !!state.done[k];
                const swapIdx = state.swaps[k] || 0;
                const alts = e.alts || [];
                const currentName = swapIdx === 0 ? e.n : (alts[swapIdx - 1] || e.n);

                return (
                  <div key={idx} className="py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <b className={`text-xs font-bold block leading-snug ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                        {currentName}
                      </b>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                        <span>{e.d}</span>
                        <span>•</span>
                        <span className="flex items-center text-orange-500 font-bold">
                          <Flame className="w-3 h-3 ml-0.5" />
                          {e.b} سعرة
                        </span>
                      </div>

                      {e.tip && (
                        <details className="mt-1 text-[11px] group cursor-pointer">
                          <summary className="text-sky-500 font-bold flex items-center gap-1 select-none">
                            <Info className="w-3 h-3" />
                            <span>تعليمات الأداء</span>
                          </summary>
                          <p className="mt-1 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed">
                            ✔ {e.tip}
                          </p>
                        </details>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      {e.sec && (
                        <button
                          onClick={() => onOpenTimer(e.sec!, currentName)}
                          title="تشغيل مؤقت التمرين"
                          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-slate-600 dark:text-slate-300 hover:text-sky-500 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <TimerIcon className="w-4 h-4" />
                        </button>
                      )}

                      {alts.length > 0 && (
                        <button
                          onClick={() => handleSwapExercise(k, alts.length)}
                          title="تبديل إلى تمرين بديل"
                          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-600 dark:text-slate-300 hover:text-teal-500 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleExercise(k, e.b, currentSession.ex.length)}
                        title={isDone ? 'إلغاء التحديد' : 'تحديد كمكتمل'}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                          isDone 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                            : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-400'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <div className="text-4xl">😌</div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">يوم راحة واستشفاء عضلات</h3>
            <p className="text-xs max-w-xs mx-auto leading-relaxed">
              عضلاتك تنمو وتبني نفسها في فترات الراحة. احرص على النوم الجيد وشرب كميات وافرة من الماء اليوم!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
