import React, { useState } from 'react';
import { AppState } from '../types/fitness';
import { todayKey, formatShortDateArabic } from '../utils/helpers';
import { DAYS_ARABIC } from '../data/fitnessData';
import { Moon, Clock, Save, Star } from 'lucide-react';

interface SleepTabProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onToast: (msg: string) => void;
  onAddXP: (xp: number) => void;
}

export const SleepTab: React.FC<SleepTabProps> = ({
  state,
  onUpdateState,
  onToast,
  onAddXP,
}) => {
  const todayStr = todayKey();
  const currentSleep = state.sleep[todayStr];

  const [sleepTime, setSleepTime] = useState(currentSleep?.sleep || '23:00');
  const [wakeTime, setWakeTime] = useState(currentSleep?.wake || '07:00');
  const [quality, setQuality] = useState(currentSleep?.quality || 5);

  const handleSaveSleep = () => {
    if (!sleepTime || !wakeTime) {
      onToast('⚠️ الرجاء تحديد وقت النوم والاستيقاظ');
      return;
    }

    const [sh, sm] = sleepTime.split(':').map(Number);
    const [wh, wm] = wakeTime.split(':').map(Number);

    let sleepTotalMin = sh * 60 + sm;
    let wakeTotalMin = wh * 60 + wm;

    if (wakeTotalMin <= sleepTotalMin) {
      // Crossed midnight
      wakeTotalMin += 24 * 60;
    }

    const hours = parseFloat(((wakeTotalMin - sleepTotalMin) / 60).toFixed(1));
    const xpReward = quality * 3;

    onUpdateState(prev => ({
      ...prev,
      sleep: {
        ...prev.sleep,
        [todayStr]: {
          sleep: sleepTime,
          wake: wakeTime,
          quality,
          hours,
        },
      },
      totals: {
        ...prev.totals,
        xp: prev.totals.xp + xpReward,
      },
    }));

    onToast(`😴 نوم هنيء! تم تسجيل ${hours} ساعة (+${xpReward} XP)`);
  };

  // Generate last 7 days history
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = todayKey(d);
    last7Days.push({
      date: d,
      key: k,
      data: state.sleep[k],
    });
  }

  return (
    <div className="space-y-3.5 pb-2">
      {/* Sleep Logger Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Moon className="w-4 h-4 text-purple-500" />
          <span>😴 تسجيل ساعات وجودة النوم</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-400" />
              <span>وقت النوم:</span>
            </label>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>وقت الاستيقاظ:</span>
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            جودة النوم والراحة:
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="5">ممتاز ونشاط كامل 🌟🌟🌟🌟🌟</option>
            <option value="4">جيد جداً ومريح 😊🌟🌟🌟🌟</option>
            <option value="3">جيد ومقبول 🙂🌟🌟🌟</option>
            <option value="2">متقطع وقليل 😐🌟🌟</option>
            <option value="1">سيء ومجهد 😴🌟</option>
          </select>
        </div>

        <button
          onClick={handleSaveSleep}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ ساعات النوم الليلة</span>
        </button>
      </div>

      {/* Last 7 Days Sleep History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-purple-500" />
            <span>📊 سجل النوم لآخر 7 أيام</span>
          </span>
          <span className="text-[10px] text-purple-500 font-bold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
            أسبوع
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {last7Days.map((d, idx) => {
            const dayName = DAYS_ARABIC[(d.date.getDay() + 1) % 7];
            const dateStr = formatShortDateArabic(d.date);

            return (
              <div
                key={idx}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-center"
              >
                {d.data ? (
                  <>
                    <b className="text-base font-black text-purple-600 dark:text-purple-400 block leading-tight">
                      {d.data.hours}h
                    </b>
                    <div className="text-[10px] text-amber-400 my-0.5">
                      {'⭐'.repeat(d.data.quality)}
                    </div>
                  </>
                ) : (
                  <>
                    <b className="text-base font-black text-slate-300 dark:text-slate-600 block leading-tight">
                      —
                    </b>
                    <small className="text-[10px] text-slate-400 block my-0.5">غير مسجل</small>
                  </>
                )}
                <small className="text-[10px] font-bold text-slate-500 block">
                  {dayName} ({dateStr})
                </small>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
