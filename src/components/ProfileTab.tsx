import React, { useState } from 'react';
import { AppState } from '../types/fitness';
import { getCurrentLevel, formatShortDateArabic, calculateStreak, todayKey } from '../utils/helpers';
import { BADGES_DATA, WEEKLY_CHALLENGES, WORKOUT_PATTERNS } from '../data/fitnessData';
import { jsPDF } from 'jspdf';
import { 
  Trophy, 
  User, 
  Calculator, 
  Mail, 
  Download, 
  Trash2, 
  FileText, 
  Flame, 
  CheckCircle2, 
  Target,
  LogOut
} from 'lucide-react';

interface ProfileTabProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onToast: (msg: string) => void;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  state,
  onUpdateState,
  onToast,
  onLogout,
}) => {
  const currentLvl = getCurrentLevel(state.totals.xp);
  const streak = calculateStreak(state.done);

  // Calorie calculator state
  const [sex, setSex] = useState<'m' | 'f'>('m');
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState(state.weights.length ? String(state.weights[state.weights.length - 1].v) : '75');
  const [activity, setActivity] = useState('1.55');
  const [goal, setGoal] = useState('-400');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  // Weekly challenge calculations
  const challenge = WEEKLY_CHALLENGES[state.weeklyChallenge % WEEKLY_CHALLENGES.length];
  let currentChallengeProgress = 0;
  if (challenge.type === 'ex') {
    currentChallengeProgress = state.totals.ex % challenge.target;
  } else if (challenge.type === 'water') {
    currentChallengeProgress = Math.floor((state.totals.water / 1000) % (challenge.target / 1000));
  } else if (challenge.type === 'meals') {
    currentChallengeProgress = state.totals.meals % challenge.target;
  } else if (challenge.type === 'sleep') {
    currentChallengeProgress = Object.keys(state.sleep).length % challenge.target;
  }
  const challengePct = Math.min(100, Math.round((currentChallengeProgress / challenge.target) * 100));

  // Compute trained, missed, and rest days since join
  const joinDate = state.user?.join ? new Date(state.user.join) : new Date();
  const today = new Date();
  let trainedDays = 0;
  let restDays = 0;
  let missedDays = 0;

  const tempDate = new Date(joinDate);
  while (tempDate <= today) {
    const k = todayKey(tempDate);
    const dayOfWeek = (tempDate.getDay() + 1) % 7;
    const isRest = WORKOUT_PATTERNS[state.days]?.[dayOfWeek] === -1;
    const isDone = Object.keys(state.done).some(dk => dk.startsWith(k));

    if (isRest) {
      restDays++;
    } else if (isDone) {
      trainedDays++;
    } else {
      missedDays++;
    }

    tempDate.setDate(tempDate.getDate() + 1);
  }

  const totalWorkoutDays = trainedDays + missedDays;
  const commitmentPct = totalWorkoutDays > 0 ? Math.round((trainedDays / totalWorkoutDays) * 100) : 100;

  // Calculate BMR & TDEE
  const handleCalculateTdee = () => {
    const a = parseInt(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!a || !h || !w) {
      onToast('⚠️ الرجاء إكمال بيانات الوزن والطول والعمر');
      return;
    }

    let bmr = 10 * w + 6.25 * h - 5 * a + (sex === 'm' ? 5 : -161);
    const cal = Math.round(bmr * parseFloat(activity) + parseFloat(goal));
    const recWater = Math.round((w * 35) / 250) * 250;
    const recProtein = Math.round(w * 1.8);

    onUpdateState(prev => ({
      ...prev,
      profile: {
        cal,
        water: recWater,
      },
    }));

    setCalcResult(`🎯 احتياجك: ${cal} سعرة • 💧 ${recWater} مل ماء • 🍗 ${recProtein} جم بروتين`);
    onToast('✅ تم حساب وحفظ احتياجك اليومي بنجاح');
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `لياقة_نسخة_احتياطية_${todayKey()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onToast('📤 تم تنزيل النسخة الاحتياطية بنجاح');
  };

  // Export PDF Report using jsPDF
  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      const userName = state.user?.name || 'البطل الرياضي';

      doc.setFontSize(22);
      doc.text('Liaqa+ Fitness Report', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`User: ${userName}`, 20, 40);
      doc.text(`Report Date: ${todayKey()}`, 20, 50);
      doc.text(`Points: ${state.totals.points} stars`, 20, 60);
      doc.text(`XP: ${state.totals.xp} XP (Level: ${currentLvl.name})`, 20, 70);
      doc.text(`Completed Workouts: ${state.totals.ex}`, 20, 80);
      doc.text(`Logged Meals: ${state.totals.meals}`, 20, 90);
      doc.text(`Water Tracked: ${state.totals.water} ml`, 20, 100);
      doc.text(`Current Streak: ${streak} days`, 20, 110);
      doc.text(`Fasting Sessions: ${state.fast.sessions} (${Math.round(state.fast.totalHours)} hours)`, 20, 120);

      if (state.weights.length > 0) {
        doc.text('Recent Weights:', 20, 135);
        state.weights.slice(-5).forEach((w, idx) => {
          doc.text(`- ${w.d}: ${w.v} kg`, 25, 145 + idx * 8);
        });
      }

      doc.save(`Liaqa_Plus_Report_${todayKey()}.pdf`);
      onToast('📄 تم توليد وتنزيل تقرير PDF بنجاح');
    } catch (err) {
      console.error(err);
      onToast('⚠️ حدث خطأ أثناء إنشاء ملف PDF');
    }
  };

  // Send Weekly Report Simulation
  const handleSendWeeklyReportNow = () => {
    onToast(`📧 تم إرسال تقريرك الأسبوعي إلى ${state.user?.email || 'بريدك الإلكتروني'}`);
  };

  // Reset All Data
  const handleResetData = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف كافة بياناتك والبدء من جديد؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      localStorage.removeItem('fitplus');
      localStorage.removeItem('fitplus_state');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-3.5 pb-2">
      {/* Level & XP Card */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl p-5 shadow-sm text-center">
        <div className="text-4xl mb-1 select-none animate-bounce">{currentLvl.icon}</div>
        <h3 className="text-lg font-black">{currentLvl.name}</h3>
        <span className="text-xs font-bold text-amber-100">
          المستوى {currentLvl.index + 1} • {state.totals.xp} XP
        </span>

        {/* Progress bar */}
        <div className="mt-3 bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${currentLvl.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/90 font-bold mt-1">
          <span>{state.totals.xp} XP</span>
          <span>{currentLvl.nextMin ? `المستوى التالي: ${currentLvl.nextMin} XP` : 'القمة المطلقة'}</span>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-black text-lg flex items-center justify-center shadow-sm">
            {state.user?.name ? state.user.name[0] : 'ب'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {state.user?.name || 'البطل الرياضي'}
            </h4>
            <p className="text-[11px] text-slate-400">
              عضو منذ {state.user?.join ? formatShortDateArabic(state.user.join) : 'اليوم'}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="تسجيل الخروج"
          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Commitment & Consistency Ring */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-teal-500" />
          <span>📊 نسبة الالتزام الإجمالية</span>
        </h3>

        <div className="flex items-center justify-around py-1">
          {/* Circular % Display */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#14b8a6"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.3}
                strokeDashoffset={251.3 - (commitmentPct / 100) * 251.3}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-slate-800 dark:text-white leading-none">
                {commitmentPct}%
              </span>
              <small className="text-[9px] text-slate-400 font-bold">التزام</small>
            </div>
          </div>

          {/* Counts */}
          <div className="space-y-1.5 text-xs font-bold">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>{trainedDays} أيام تمرين ✅</span>
            </div>
            <div className="flex items-center gap-2 text-rose-500">
              <span>❌</span>
              <span>{missedDays} غياب</span>
            </div>
            <div className="flex items-center gap-2 text-amber-500">
              <span>😌</span>
              <span>{restDays} راحة واستشفاء</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Challenge Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>{challenge.title}</span>
          </h3>
          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
            تحدي الأسبوع
          </span>
        </div>
        <p className="text-xs text-purple-100 font-medium">{challenge.desc}</p>
        <div className="bg-white/20 rounded-full h-2 overflow-hidden mt-1">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${challengePct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-purple-200">
          <span>{currentChallengeProgress} / {challenge.target}</span>
          <span>{challengePct}%</span>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>🎖️ أوسمة وإنجازات البطل</span>
          </span>
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {BADGES_DATA.map((badge) => {
            const isEarned = badge.check(state);
            return (
              <div
                key={badge.id}
                title={`${badge.n}: ${badge.desc}`}
                className={`p-2 rounded-xl text-center border transition-all ${
                  isEarned
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-40 grayscale'
                }`}
              >
                <div className="text-2xl mb-1">{badge.e}</div>
                <b className="text-[10px] font-black text-slate-800 dark:text-slate-200 block leading-tight truncate">
                  {badge.n}
                </b>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calorie & Hydration Calculator (BMR & TDEE) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-sky-500" />
          <span>🧮 حاسبة السعرات والترطيب الذكية</span>
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">الجنس:</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            >
              <option value="m">ذكر</option>
              <option value="f">أنثى</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">العمر:</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">الطول (سم):</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">الوزن (كجم):</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">مستوى النشاط:</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            >
              <option value="1.2">خامل (مكتبي)</option>
              <option value="1.375">نشاط خفيف (1-3 أيام)</option>
              <option value="1.55">متوسط (3-5 أيام)</option>
              <option value="1.725">نشيط جداً (6-7 أيام)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">هدفك الرياضي:</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
          >
            <option value="-400">خسارة دهون وتنشيف (-400 سعرة)</option>
            <option value="0">تثبيت الوزن الحالي (0 سعرة)</option>
            <option value="300">بناء عضلات وتضخيم (+300 سعرة)</option>
          </select>
        </div>

        <button
          onClick={handleCalculateTdee}
          className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          احسب وثبت خطتي اليومية
        </button>

        {calcResult && (
          <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 rounded-xl text-xs font-bold text-center">
            {calcResult}
          </div>
        )}
      </div>

      {/* Email Report Settings & Dispatch */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-purple-500" />
          <span>📧 تقرير اللياقة الأسبوعي في بريدك</span>
        </h3>

        <div className="flex gap-2">
          <button
            onClick={handleSendWeeklyReportNow}
            className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>إرسال تقرير الآن</span>
          </button>
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Download className="w-4 h-4 text-teal-500" />
          <span>💾 إدارة البيانات وتصدير السجل</span>
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportJson}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>نسخة JSON</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تقرير PDF</span>
          </button>
        </div>

        <button
          onClick={handleResetData}
          className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:bg-rose-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>تصفير وإعادة تعيين البيانات</span>
        </button>
      </div>
    </div>
  );
};
