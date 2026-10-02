import React, { useState } from 'react';
import { AppState, ProgressPhoto } from '../types/fitness';
import { todayKey, formatShortDateArabic, compressImage } from '../utils/helpers';
import { DAYS_ARABIC } from '../data/fitnessData';
import { Scale, Ruler, Camera, Calendar, TrendingDown, TrendingUp, Eye, Sparkles } from 'lucide-react';

interface StatsTabProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onToast: (msg: string) => void;
  onOpenPhotoModal: (photoUrl: string) => void;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  state,
  onUpdateState,
  onToast,
  onOpenPhotoModal,
}) => {
  const todayStr = todayKey();
  const [weightInput, setWeightInput] = useState('');
  
  // Body measurements
  const [waist, setWaist] = useState(state.measures.w || '');
  const [chest, setChest] = useState(state.measures.c || '');
  const [arm, setArm] = useState(state.measures.a || '');

  // Photo upload
  const [selectedPhotoType, setSelectedPhotoType] = useState<'before' | 'progress' | 'after'>('before');
  const [photoWeight, setPhotoWeight] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFilter, setPhotoFilter] = useState<'all' | 'before' | 'progress' | 'after'>('all');
  const [isUploading, setIsUploading] = useState(false);

  // Weight logging
  const handleAddWeight = () => {
    const val = parseFloat(weightInput);
    if (!val || val <= 0) {
      onToast('⚠️ الرجاء إدخال وزن صحيح بالكيلوغرام');
      return;
    }

    onUpdateState(prev => ({
      ...prev,
      weights: [...prev.weights, { d: todayStr, v: val }],
    }));

    setWeightInput('');
    onToast(`⚖️ تم تسجيل وزنك: ${val} كجم`);
  };

  // Body measurements
  const handleSaveMeasures = () => {
    onUpdateState(prev => ({
      ...prev,
      measures: { w: waist, c: chest, a: arm },
    }));
    onToast('📏 تم حفظ قياسات الجسم بنجاح');
  };

  // Photo file selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file, 1000, 0.8);
      setPhotoPreview(compressedDataUrl);
    } catch (err) {
      console.error(err);
      onToast('⚠️ تعذر معالجة الصورة، جرب صورة أخرى');
    }
  };

  // Upload photo
  const handleUploadPhoto = () => {
    if (!photoPreview) {
      onToast('⚠️ الرجاء اختيار صورة أولاً');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      const newPhoto: ProgressPhoto = {
        id: 'photo_' + Date.now(),
        url: photoPreview,
        type: selectedPhotoType,
        weight: photoWeight ? parseFloat(photoWeight) : undefined,
        date: new Date().toISOString(),
      };

      onUpdateState(prev => ({
        ...prev,
        photos: [newPhoto, ...prev.photos],
        totals: {
          ...prev.totals,
          points: prev.totals.points + 10,
          xp: prev.totals.xp + 15,
        },
      }));

      setIsUploading(false);
      setPhotoPreview(null);
      setPhotoWeight('');
      onToast('📸 تم حفظ صورة التقدم بنجاح (+15 XP)');
    }, 400);
  };

  // Filtered photos
  const filteredPhotos = photoFilter === 'all'
    ? state.photos
    : state.photos.filter(p => p.type === photoFilter);

  // Before & After comparison
  const beforePhoto = state.photos.find(p => p.type === 'before');
  const afterPhoto = state.photos.find(p => p.type === 'after');
  const weightDiff = (beforePhoto?.weight && afterPhoto?.weight)
    ? (afterPhoto.weight - beforePhoto.weight).toFixed(1)
    : null;

  // Calendar calculations
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
  const firstDayOfMonthOffset = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 1) % 7;
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const todayDayNumber = now.getDate();

  // 7-day calories burned
  const last7DaysBurn = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = todayKey(d);
    const burned = Object.entries(state.done)
      .filter(([dk]) => dk.startsWith(k))
      .reduce((sum, [, v]) => sum + v, 0);
    last7DaysBurn.push({
      date: d,
      burned,
    });
  }
  const maxBurnInWeek = Math.max(...last7DaysBurn.map(x => x.burned), 300);

  return (
    <div className="space-y-3.5 pb-2">
      {/* Weight Tracker Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-sky-500" />
          <span>⚖️ تسجيل ومتابعة الوزن</span>
        </h3>

        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="الوزن الحالي بالكيلوغرام (مثال: 75.5)"
            className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={handleAddWeight}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            تسجيل
          </button>
        </div>

        {/* Weight Visual Timeline / SVG Chart */}
        {state.weights.length > 1 ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-2">
              <span>مسار الوزن الأخير ({state.weights.length} تسجيلات)</span>
              <span className="text-sky-500">
                الحالي: {state.weights[state.weights.length - 1].v} كجم
              </span>
            </div>
            
            <div className="h-28 flex items-end gap-1.5 pt-4">
              {state.weights.slice(-10).map((w, idx, arr) => {
                const minW = Math.min(...arr.map(x => x.v)) - 2;
                const maxW = Math.max(...arr.map(x => x.v)) + 2;
                const range = Math.max(1, maxW - minW);
                const heightPct = Math.max(10, Math.min(100, ((w.v - minW) / range) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div 
                      className="w-full bg-gradient-to-t from-sky-500 to-teal-400 rounded-t-md transition-all group-hover:brightness-110 min-h-2"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">
                      {w.v}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 text-center py-2">
            سجل وزنين على الأقل لإظهار الرسم البياني ومسار التقدم
          </p>
        )}
      </div>

      {/* Body Measurements Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Ruler className="w-4 h-4 text-teal-500" />
            <span>📏 قياسات محيط الجسم (سم)</span>
          </span>
          <span className="text-[10px] text-teal-500 font-bold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full">
            شريط القياس
          </span>
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">محيط الخصر:</label>
            <input
              type="number"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder="مثال: 80"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">محيط الصدر:</label>
            <input
              type="number"
              value={chest}
              onChange={(e) => setChest(e.target.value)}
              placeholder="مثال: 95"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">محيط الذراع:</label>
            <input
              type="number"
              value={arm}
              onChange={(e) => setArm(e.target.value)}
              placeholder="مثال: 34"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
            />
          </div>
        </div>

        <button
          onClick={handleSaveMeasures}
          className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          حفظ قياسات الجسم
        </button>
      </div>

      {/* Progress Photos Upload & Gallery */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-sky-500" />
            <span>📸 معرض صور التقدم والتحول</span>
          </span>
          <span className="text-[10px] text-sky-500 font-bold bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full">
            {state.photos.length} صور
          </span>
        </h3>

        {/* Upload Box */}
        <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-sky-500 rounded-2xl p-5 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <Camera className="w-8 h-8 text-sky-500 mb-2" />
          <b className="text-xs text-slate-800 dark:text-slate-100 block">اضغط لرفع صورة جديدة</b>
          <span className="text-[10px] text-slate-400">يمكنك التقاط صورة بالكاميرا أو اختيارها من المعرض</span>
        </label>

        {photoPreview && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2.5 border border-slate-200 dark:border-slate-700">
            <img src={photoPreview} alt="معاينة" className="max-h-48 rounded-lg mx-auto object-cover" />

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'before', label: '📷 قبل' },
                { id: 'progress', label: '🔄 تقدم' },
                { id: 'after', label: '✅ بعد' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedPhotoType(t.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPhotoType === t.id
                      ? 'bg-gradient-to-r from-sky-500 to-teal-400 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <input
              type="number"
              step="0.1"
              value={photoWeight}
              onChange={(e) => setPhotoWeight(e.target.value)}
              placeholder="الوزن وقت التقاط الصورة (اختياري)"
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-center"
            />

            <button
              onClick={handleUploadPhoto}
              disabled={isUploading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 text-white font-bold text-xs shadow-md transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isUploading ? 'جاري الحفظ...' : 'حفظ الصورة في سجل التقدم'}
            </button>
          </div>
        )}

        {/* Gallery Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'before', label: 'قبل' },
            { id: 'progress', label: 'تقدم' },
            { id: 'after', label: 'بعد' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setPhotoFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                photoFilter === f.id
                  ? 'bg-gradient-to-r from-sky-500 to-teal-400 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {filteredPhotos.map((p) => {
              const label = p.type === 'before' ? '📷 قبل' : p.type === 'after' ? '✅ بعد' : '🔄 تقدم';
              return (
                <div
                  key={p.id}
                  onClick={() => onOpenPhotoModal(p.url)}
                  className="relative rounded-xl overflow-hidden aspect-square cursor-pointer group shadow-sm bg-slate-100 dark:bg-slate-800"
                >
                  <img src={p.url} alt="تقدم" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white px-2 py-0.5 rounded-md text-[10px] font-black shadow-xs">
                    {label}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
                    <b className="text-[11px] block leading-tight font-bold">
                      {formatShortDateArabic(p.date)}
                      {p.weight && ` • ${p.weight} كجم`}
                    </b>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-4 text-xs text-slate-400">
            لا توجد صور في هذا التصنيف بعد
          </p>
        )}
      </div>

      {/* Side-by-Side Comparison Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>🔍 مقارنة التحول (قبل وبعد)</span>
        </h3>

        {beforePhoto && afterPhoto ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => onOpenPhotoModal(beforePhoto.url)}
                className="text-center cursor-pointer group"
              >
                <div className="rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-700 mb-1.5">
                  <img src={beforePhoto.url} alt="قبل" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <b className="text-xs text-slate-800 dark:text-white block font-bold">📷 قبل التحول</b>
                {beforePhoto.weight && (
                  <span className="text-[10px] text-slate-400 font-semibold">{beforePhoto.weight} كجم</span>
                )}
              </div>

              <div 
                onClick={() => onOpenPhotoModal(afterPhoto.url)}
                className="text-center cursor-pointer group"
              >
                <div className="rounded-xl overflow-hidden aspect-square border-2 border-emerald-500 mb-1.5">
                  <img src={afterPhoto.url} alt="بعد" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <b className="text-xs text-emerald-500 block font-bold">✅ بعد التحول</b>
                {afterPhoto.weight && (
                  <span className="text-[10px] text-slate-400 font-semibold">{afterPhoto.weight} كجم</span>
                )}
              </div>
            </div>

            {weightDiff !== null && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-center gap-1 text-base font-black">
                  {parseFloat(weightDiff) < 0 ? (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <TrendingDown className="w-5 h-5" />
                      {weightDiff} كجم
                    </span>
                  ) : (
                    <span className="text-sky-500 flex items-center gap-1">
                      <TrendingUp className="w-5 h-5" />
                      +{weightDiff} كجم
                    </span>
                  )}
                </div>
                <small className="text-[10px] text-slate-400 font-bold block mt-0.5">
                  إجمالي الفرق في الوزن بين المرحلتين 🎯
                </small>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center py-4 text-xs text-slate-400">
            ارفع صورة تصنيف "قبل" وصورة تصنيف "بعد" لتفعيل المقارنة التلقائية وفرق الوزن
          </p>
        )}
      </div>

      {/* Activity Calendar Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-sky-500" />
          <span>📅 تقويم الالتزام الرياضي — {currentMonthName}</span>
        </h3>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 pb-1">
          {['س', 'أ', 'ن', 'ث', 'ر', 'خ', 'ج'].map((h, i) => (
            <div key={i}>{h}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Offset blanks */}
          {[...Array(firstDayOfMonthOffset)].map((_, i) => (
            <div key={`blank-${i}`} />
          ))}

          {/* Days */}
          {[...Array(daysInCurrentMonth)].map((_, i) => {
            const dayNum = i + 1;
            const d = new Date(now.getFullYear(), now.getMonth(), dayNum);
            const dateK = todayKey(d);
            const isTrained = Object.keys(state.done).some(k => k.startsWith(dateK));
            const isToday = dayNum === todayDayNumber;

            return (
              <div
                key={dayNum}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  isTrained
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isToday
                    ? 'ring-2 ring-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Calories Burned Bars */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span>📈 معدل الحرق في آخر 7 أيام (سعرات)</span>
          </span>
        </h3>

        <div className="h-28 flex items-end gap-2 pt-4">
          {last7DaysBurn.map((x, idx) => {
            const heightPct = Math.max(5, Math.min(100, (x.burned / maxBurnInWeek) * 100));
            const dayInitial = DAYS_ARABIC[(x.date.getDay() + 1) % 7][0];

            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                <div 
                  className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-md transition-all min-h-1"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] text-slate-400 mt-1 font-bold">
                  {dayInitial}
                </span>
                <span className="text-[9px] text-orange-500 font-mono">
                  {x.burned > 0 ? x.burned : 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
