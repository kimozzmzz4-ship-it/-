import React from 'react';
import { AppState } from '../types/fitness';
import { BUDDIES_DATA, QUOTES_DATA, DAILY_QUESTS, PHASES, WORKOUT_PATTERNS } from '../data/fitnessData';
import { todayKey, calculateStreak } from '../utils/helpers';
import { Flame, Utensils, Droplets, Moon, CheckCircle2, Circle, Plus, Minus } from 'lucide-react';

interface HomeTabProps {
  state: AppState;
  onAddWater: (amount: number) => void;
  onCompleteQuest: (questId: string, reward: number) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ state, onAddWater, onCompleteQuest }) => {
  const todayStr = todayKey();

  // Buddy selection based on day
  const buddyIndex = new Date().getDate() % BUDDIES_DATA.length;
  const buddy = BUDDIES_DATA[buddyIndex];
  const buddyMessage = buddy.msgs[new Date().getHours() % buddy.msgs.length];

  // Daily Quote
  const quote = QUOTES_DATA[new Date().getDate() % QUOTES_DATA.length];

  // Current session info
  const dayIdx = (new Date().getDay() + 1) % 7;
  const pat = WORKOUT_PATTERNS[state.days]?.[dayIdx];
  const currentPhase = PHASES[state.phase] || PHASES[0];
  const currentSession = pat !== undefined && pat !== -1 ? currentPhase.sessions[pat % currentPhase.sessions.length] : null;

  // Stats calculation
  const burnedToday = Object.entries(state.done)
    .filter(([k]) => k.startsWith(todayStr))
    .reduce((sum, [, v]) => sum + v, 0);

  const eatenToday = Object.entries(state.eaten)
    .filter(([k]) => k.startsWith(todayStr))
    .reduce((sum, [, v]) => sum + v, 0);

  const mealsCount = Object.keys(state.eaten).filter(k => k.startsWith(todayStr)).length;
  const streak = calculateStreak(state.done);
  const sleepToday = state.sleep[todayStr];

  // Goals
  const burnGoal = 400;
  const eatGoal = state.profile?.cal || 1850;
  const waterGoal = state.profile?.water || 2500;

  const burnPct = Math.min(100, Math.round((burnedToday / burnGoal) * 100));
  const eatPct = Math.min(100, Math.round((eatenToday / eatGoal) * 100));
  const waterPct = Math.min(100, Math.round((state.water.ml / waterGoal) * 100));

  return (
    <div className="space-y-3.5 pb-2">
      {/* Buddy Card */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="text-4xl animate-bounce select-none shrink-0">
          {buddy.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-md">شريكك الرياضي</span>
            <b className="text-xs font-bold text-purple-100">{buddy.name}</b>
          </div>
          <p className="text-xs text-white/95 leading-relaxed font-medium">
            "{buddyMessage}"
          </p>
        </div>
      </div>

      {/* Quote Card */}
      <div className="bg-gradient-to-r from-teal-500 to-sky-500 text-white text-center font-bold text-xs p-3.5 rounded-2xl shadow-sm leading-relaxed">
        {quote}
      </div>

      {/* Daily Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mb-2.5 flex items-center justify-between">
          <span>📋 ملخص نشاط اليوم</span>
          <span className="text-[10px] text-sky-500 font-bold bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full">اليوم</span>
        </h3>
        <div className="divide-y divide-dashed divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-2 flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">🏋️ تمرين اليوم:</span>
            <b className="text-slate-900 dark:text-white font-bold">
              {currentSession ? `${currentSession.t} (${currentSession.ex.length} تمارين)` : '😌 يوم راحة واستشفاء'}
            </b>
          </div>
          <div className="py-2 flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">🍽️ الوجبات المسجلة:</span>
            <b className="text-slate-900 dark:text-white font-bold">{mealsCount} من 5 وجبات</b>
          </div>
          <div className="py-2 flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">💧 شرب الماء:</span>
            <b className="text-slate-900 dark:text-white font-bold">{state.water.ml} / {waterGoal} مل</b>
          </div>
          <div className="py-2 flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">😴 النوم المسجل:</span>
            <b className="text-slate-900 dark:text-white font-bold">
              {sleepToday ? `${sleepToday.hours} ساعة (${sleepToday.quality}⭐)` : 'لم يسجل بعد'}
            </b>
          </div>
          <div className="py-2 flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">🔥 شعلة الالتزام:</span>
            <b className="text-orange-500 font-black">{streak} يوم متتالي</b>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-1.5">
          <span>📊 معدلات الإنجاز اليومية</span>
        </h3>

        {/* Burned */}
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            <span className="flex items-center gap-1 text-orange-500">
              <Flame className="w-3.5 h-3.5" />
              <span>محروق بالتمرين</span>
            </span>
            <span>{burnedToday} / {burnGoal} سعرة ({burnPct}%)</span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500" 
              style={{ width: `${burnPct}%` }}
            />
          </div>
        </div>

        {/* Eaten */}
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            <span className="flex items-center gap-1 text-emerald-500">
              <Utensils className="w-3.5 h-3.5" />
              <span>مستهلك بالوجبات</span>
            </span>
            <span>{eatenToday} / {eatGoal} سعرة ({eatPct}%)</span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" 
              style={{ width: `${eatPct}%` }}
            />
          </div>
        </div>

        {/* Water */}
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            <span className="flex items-center gap-1 text-sky-500">
              <Droplets className="w-3.5 h-3.5" />
              <span>ارتواء الماء</span>
            </span>
            <span>{state.water.ml} / {waterGoal} مل ({waterPct}%)</span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${waterPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Water Tracker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-sky-500" />
            <span>تسجيل شرب الماء السريع</span>
          </span>
          <span className="text-[11px] font-bold text-sky-500">{state.water.ml} مل</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAddWater(250)}
            className="py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+250 مل</span>
          </button>
          <button
            onClick={() => onAddWater(500)}
            className="py-2.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+500 مل</span>
          </button>
          <button
            onClick={() => onAddWater(-250)}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>-250 مل</span>
          </button>
        </div>
      </div>

      {/* Daily Quests */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span>🎯 مهام اليوم اليومية</span>
          </h3>
          <span className="text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
            اكسب نقاط XP
          </span>
        </div>

        <div className="space-y-2">
          {DAILY_QUESTS.map((q) => {
            const isCompleted = state.questsDone[todayStr]?.[q.id] || q.check(state);

            return (
              <div 
                key={q.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isCompleted 
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 opacity-80' 
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">{q.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold leading-tight ${isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {q.desc}
                    </p>
                    <small className="text-[10px] text-slate-400">
                      {isCompleted ? 'مكتملة بنجاح ✅' : 'قيد الإنجاز'}
                    </small>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                    +{q.reward} XP
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
