import React, { useState, useEffect } from 'react';
import { AppState, UserProfile } from './types/fitness';
import { todayKey, currentDayIndex } from './utils/helpers';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { HomeTab } from './components/HomeTab';
import { WorkoutTab } from './components/WorkoutTab';
import { NutritionTab } from './components/NutritionTab';
import { FastingTab } from './components/FastingTab';
import { SleepTab } from './components/SleepTab';
import { StatsTab } from './components/StatsTab';
import { AiCoachTab } from './components/AiCoachTab';
import { ProfileTab } from './components/ProfileTab';
import { TimerModal } from './components/TimerModal';
import { PhotoModal } from './components/PhotoModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { 
  Home, 
  Dumbbell, 
  Salad, 
  Timer, 
  Moon, 
  Camera, 
  Bot, 
  User 
} from 'lucide-react';

const STORAGE_KEY = 'fitplus_state';

const DEFAULT_STATE: AppState = {
  user: null,
  dark: false,
  days: 4,
  phase: 0,
  week: 0,
  day: currentDayIndex(),
  water: { d: todayKey(), ml: 0 },
  eaten: {},
  done: {},
  swaps: {},
  mealCh: {},
  bonus: {},
  weights: [
    { d: '2026-09-20', v: 78.5 },
    { d: '2026-09-27', v: 77.2 },
    { d: todayKey(), v: 76.4 },
  ],
  measures: { w: '82', c: '98', a: '33' },
  totals: {
    ex: 12,
    meals: 24,
    water: 18500,
    points: 340,
    xp: 280,
  },
  profile: {
    cal: 1850,
    water: 2500,
  },
  fast: {
    mode: '16:8',
    startTime: null,
    sessions: 4,
    totalHours: 64,
  },
  sleep: {},
  photos: [],
  questsDone: {},
  weeklyChallenge: 0,
  aiMessages: [],
  emailSettings: {
    reportDay: 7,
    lastSent: null,
  },
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('fitplus');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure water date is today
        const todayStr = todayKey();
        if (parsed.water?.d !== todayStr) {
          parsed.water = { d: todayStr, ml: 0 };
        }
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return DEFAULT_STATE;
  });

  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'nutrition' | 'fast' | 'sleep' | 'stats' | 'ai' | 'profile'>('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [timerModal, setTimerModal] = useState<{ isOpen: boolean; seconds: number; title: string }>({
    isOpen: false,
    seconds: 60,
    title: 'مؤقت',
  });
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync state to localStorage & dark mode class
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem('fitplus', JSON.stringify(state));

    if (state.dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [state]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleToggleDark = () => {
    setState(prev => ({ ...prev, dark: !prev.dark }));
  };

  const handleAddWater = (amount: number) => {
    const todayStr = todayKey();
    const waterGoal = state.profile?.water || 2500;
    
    setState(prev => {
      const currentMl = prev.water.d === todayStr ? prev.water.ml : 0;
      const nextMl = Math.max(0, Math.min(waterGoal + 1000, currentMl + amount));
      const added = nextMl - currentMl;
      const newTotalWater = Math.max(0, prev.totals.water + Math.max(0, added));

      let nextPts = prev.totals.points;
      let nextXp = prev.totals.xp;
      if (amount > 0) {
        nextPts += 2;
        nextXp += 2;
      }

      return {
        ...prev,
        water: { d: todayStr, ml: nextMl },
        totals: {
          ...prev.totals,
          water: newTotalWater,
          points: nextPts,
          xp: nextXp,
        },
      };
    });

    if (amount > 0) {
      showToast(`💧 رائع! أضفت ${amount} مل ماء (+2 ⭐)`);
    } else {
      showToast('💧 تم التراجع عن كمية الماء');
    }
  };

  const handleAddPts = (pts: number, reason: string) => {
    setState(prev => ({
      ...prev,
      totals: {
        ...prev.totals,
        points: prev.totals.points + pts,
      },
    }));
    showToast(`+${pts} ⭐ ${reason}`);
  };

  const handleAddXP = (xp: number) => {
    setState(prev => ({
      ...prev,
      totals: {
        ...prev.totals,
        xp: prev.totals.xp + xp,
      },
    }));
  };

  const handleCompleteQuest = (questId: string, reward: number) => {
    const todayStr = todayKey();
    setState(prev => {
      const todayQuests = prev.questsDone[todayStr] || {};
      if (todayQuests[questId]) return prev;

      return {
        ...prev,
        questsDone: {
          ...prev.questsDone,
          [todayStr]: {
            ...todayQuests,
            [questId]: true,
          },
        },
        totals: {
          ...prev.totals,
          xp: prev.totals.xp + reward,
        },
      };
    });
    showToast(`🎯 أحسنت! مهمة يومية مكتملة (+${reward} XP)`);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setState(prev => ({ ...prev, user }));
    setIsAuthModalOpen(false);
    setCurrentView('app');
    showToast(`🎉 أهلاً بك يا ${user.name}! مرحباً بك في لياقة+`);
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      setState(prev => ({ ...prev, user: null }));
      setCurrentView('landing');
      showToast('👋 تم تسجيل الخروج');
    }
  };

  // If viewing landing page
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={() => {
            if (!state.user) {
              setIsAuthModalOpen(true);
            } else {
              setCurrentView('app');
            }
          }}
          onToast={showToast}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </>
    );
  }

  // App View
  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
    { id: 'workout', label: 'تمارين', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'nutrition', label: 'تغذية', icon: <Salad className="w-5 h-5" /> },
    { id: 'fast', label: 'صيام', icon: <Timer className="w-5 h-5" /> },
    { id: 'sleep', label: 'نوم', icon: <Moon className="w-5 h-5" /> },
    { id: 'stats', label: 'تقدمي', icon: <Camera className="w-5 h-5" /> },
    { id: 'ai', label: 'مدرب', icon: <Bot className="w-5 h-5" /> },
    { id: 'profile', label: 'حسابي', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex justify-center selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900 min-h-screen relative pb-24 shadow-2xl flex flex-col border-x border-slate-200 dark:border-slate-800">
        {/* Top Header */}
        <Header
          xp={state.totals.xp}
          points={state.totals.points}
          dark={state.dark}
          onToggleDark={handleToggleDark}
          onGoLanding={() => setCurrentView('landing')}
        />

        {/* Main Content Pages */}
        <main className="flex-1 p-3.5 overflow-x-hidden">
          {activeTab === 'home' && (
            <HomeTab
              state={state}
              onAddWater={handleAddWater}
              onCompleteQuest={handleCompleteQuest}
            />
          )}

          {activeTab === 'workout' && (
            <WorkoutTab
              state={state}
              onUpdateState={setState}
              onOpenTimer={(seconds, title) => setTimerModal({ isOpen: true, seconds, title })}
              onToast={showToast}
              onAddPts={handleAddPts}
              onAddXP={handleAddXP}
            />
          )}

          {activeTab === 'nutrition' && (
            <NutritionTab
              state={state}
              onUpdateState={setState}
              onToast={showToast}
            />
          )}

          {activeTab === 'fast' && (
            <FastingTab
              state={state}
              onUpdateState={setState}
              onToast={showToast}
              onAddPts={handleAddPts}
              onAddXP={handleAddXP}
            />
          )}

          {activeTab === 'sleep' && (
            <SleepTab
              state={state}
              onUpdateState={setState}
              onToast={showToast}
              onAddXP={handleAddXP}
            />
          )}

          {activeTab === 'stats' && (
            <StatsTab
              state={state}
              onUpdateState={setState}
              onToast={showToast}
              onOpenPhotoModal={(url) => setModalPhotoUrl(url)}
            />
          )}

          {activeTab === 'ai' && (
            <AiCoachTab
              state={state}
              onUpdateState={setState}
              onToast={showToast}
              onAddXP={handleAddXP}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              state={state}
              onUpdateState={setState}
              onToast={showToast}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Bottom Floating Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1 z-40 shadow-lg rounded-t-2xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                  isActive
                    ? 'text-sky-500 scale-105 font-black'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-sky-50 dark:bg-sky-950/60' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] leading-none mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Modals & Alerts */}
      <TimerModal
        isOpen={timerModal.isOpen}
        initialSeconds={timerModal.seconds}
        title={timerModal.title}
        onClose={() => setTimerModal(prev => ({ ...prev, isOpen: false }))}
        onFinished={() => showToast('⏰ انتهى وقت التمرين أو الاستراحة!')}
      />

      <PhotoModal
        photoUrl={modalPhotoUrl}
        onClose={() => setModalPhotoUrl(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
