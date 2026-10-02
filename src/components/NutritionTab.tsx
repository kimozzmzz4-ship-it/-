import React, { useState } from 'react';
import { AppState } from '../types/fitness';
import { MEALS_DATA, DRINKS_DATA, RECIPES_DATA } from '../data/fitnessData';
import { todayKey } from '../utils/helpers';
import { Utensils, RefreshCw, Check, Coffee, BookOpen } from 'lucide-react';

interface NutritionTabProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onToast: (msg: string) => void;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  state,
  onUpdateState,
  onToast,
}) => {
  const [recipeFilter, setRecipeFilter] = useState('الكل');
  const todayStr = todayKey();

  const eatenToday = Object.entries(state.eaten)
    .filter(([k]) => k.startsWith(todayStr))
    .reduce((sum, [, v]) => sum + v, 0);

  const eatGoal = state.profile?.cal || 1850;

  const handleSwapMeal = (mealIdx: number) => {
    onUpdateState(prev => ({
      ...prev,
      mealCh: {
        ...prev.mealCh,
        [mealIdx]: ((prev.mealCh[mealIdx] || 0) + 1) % MEALS_DATA[mealIdx].opts.length,
      },
    }));
    onToast('🔄 تم تغيير اقتراح الوجبة');
  };

  const handleToggleMeal = (mealKey: string, calories: number) => {
    const isEaten = !!state.eaten[mealKey];

    onUpdateState(prev => {
      const nextEaten = { ...prev.eaten };
      let nextMealsTotal = prev.totals.meals;
      let nextPoints = prev.totals.points;
      let nextXp = prev.totals.xp;

      if (isEaten) {
        delete nextEaten[mealKey];
        nextMealsTotal = Math.max(0, nextMealsTotal - 1);
      } else {
        nextEaten[mealKey] = calories;
        nextMealsTotal += 1;
        nextPoints += 5;
        nextXp += 5;
      }

      return {
        ...prev,
        eaten: nextEaten,
        totals: {
          ...prev.totals,
          meals: nextMealsTotal,
          points: nextPoints,
          xp: nextXp,
        },
      };
    });

    if (!isEaten) {
      onToast(`🍽️ صحتين وعافية! تم تسجيل الوجبة (+5 ⭐ و +5 XP)`);
    }
  };

  const recipeCategories = ['الكل', ...Array.from(new Set(RECIPES_DATA.map(r => r.t)))];
  const filteredRecipes = recipeFilter === 'الكل' 
    ? RECIPES_DATA 
    : RECIPES_DATA.filter(r => r.t === recipeFilter);

  return (
    <div className="space-y-3.5 pb-2">
      {/* Daily Meals Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-emerald-500" />
            <span>🍽️ وجبات اليوم المقترحة (5 وجبات)</span>
          </h3>
          <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            {eatenToday} / {eatGoal} سعرة
          </span>
        </div>

        <div className="divide-y divide-dashed divide-slate-100 dark:divide-slate-800">
          {MEALS_DATA.map((meal, idx) => {
            const k = `${todayStr}|m${idx}`;
            const isEaten = !!state.eaten[k];
            const chIdx = state.mealCh[idx] || 0;
            const chosenOption = meal.opts[chIdx] || meal.opts[0];

            return (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-slate-400">{meal.n}</span>
                    <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                      {meal.c} سعرة
                    </span>
                  </div>
                  <b className={`text-xs block leading-snug ${isEaten ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {chosenOption}
                  </b>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleSwapMeal(idx)}
                    title="اقتراح بديل"
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleMeal(k, meal.c)}
                    title={isEaten ? 'إلغاء التناول' : 'تم تناولها'}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                      isEaten 
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

      {/* Drinks Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5">
          <Coffee className="w-4 h-4 text-sky-500" />
          <span>🥤 مشروبات داعمة للأيض والطاقة</span>
        </h3>

        <div className="space-y-2">
          {DRINKS_DATA.map((d, idx) => (
            <div 
              key={idx} 
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3"
            >
              <span className="text-2xl shrink-0">{d.e}</span>
              <div className="flex-1 min-w-0">
                <b className="text-xs text-slate-900 dark:text-white block font-bold">{d.n}</b>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{d.d}</p>
                <small className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold block mt-0.5">
                  ✔ الفائدة: {d.b}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Healthy Recipes Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-teal-500" />
            <span>📖 وصفات صحية سريعة التحضير</span>
          </h3>
        </div>

        {/* Categories Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {recipeCategories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setRecipeFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                recipeFilter === cat
                  ? 'bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recipes List */}
        <div className="space-y-2.5">
          {filteredRecipes.map((r, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <b className="text-xs font-bold text-slate-900 dark:text-white">{r.n}</b>
                <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">
                  {r.c} سعرة
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-semibold">🧺 المكونات: </span>
                <span>{r.ing}</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-semibold">👨‍🍳 طريقة التحضير: </span>
                <span>{r.how}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
