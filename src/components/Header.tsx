import React from 'react';
import { Moon, Sun, Home, Zap } from 'lucide-react';
import { formatDateArabic, getCurrentLevel } from '../utils/helpers';

interface HeaderProps {
  xp: number;
  points: number;
  dark: boolean;
  onToggleDark: () => void;
  onGoLanding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  xp,
  points,
  dark,
  onToggleDark,
  onGoLanding,
}) => {
  const currentLvl = getCurrentLevel(xp);

  return (
    <header className="bg-gradient-to-r from-sky-500 to-teal-400 text-white px-4 py-3.5 rounded-b-3xl shadow-md shadow-sky-500/10 flex justify-between items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight leading-tight">لياقة+</h1>
          <p className="text-[10px] text-sky-100 font-medium">
            {formatDateArabic()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {/* Level Badge */}
        <span 
          title={`${currentLvl.name} (${xp} XP)`}
          className="bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full px-2.5 py-1 text-[11px] font-black shadow-sm flex items-center gap-1 cursor-default"
        >
          <span>{currentLvl.icon}</span>
          <span>مستوى {currentLvl.index + 1}</span>
        </span>

        {/* Sync Indicator */}
        <div 
          title="المزامنة نشطة ومحفوظة" 
          className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] font-bold flex items-center gap-1 border border-white/20"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Points Badge */}
        <span className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] font-extrabold border border-white/20">
          ⭐ {points}
        </span>

        {/* Dark Mode Button */}
        <button
          onClick={onToggleDark}
          title={dark ? "الوضع الفاتح" : "الوضع الليلي"}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer text-white"
        >
          {dark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Back to Landing */}
        <button
          onClick={onGoLanding}
          title="الصفحة الرئيسية"
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer text-white"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
