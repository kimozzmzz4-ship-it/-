import confetti from 'canvas-confetti';
import { LEVELS } from '../data/fitnessData';
import { LevelInfo } from '../types/fitness';

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function currentDayIndex(): number {
  // Saturday = 0, Sunday = 1, ..., Friday = 6 in Arabic custom
  return (new Date().getDay() + 1) % 7;
}

export function formatDateArabic(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return d.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDateArabic(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return d.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'short',
  });
}

export function calculateStreak(doneRecords: Record<string, number>): number {
  let streak = 0;
  const d = new Date();
  const hasLog = (keyStr: string) => Object.keys(doneRecords).some(k => k.startsWith(keyStr));

  // If today doesn't have a log yet, start checking from yesterday
  if (!hasLog(todayKey(d))) {
    d.setDate(d.getDate() - 1);
  }

  let safety = 0;
  while (hasLog(todayKey(d)) && safety < 365) {
    streak++;
    d.setDate(d.getDate() - 1);
    safety++;
  }

  return streak;
}

export interface CurrentLevelCalculation extends LevelInfo {
  index: number;
  progress: number;
  nextMin: number | null;
}

export function getCurrentLevel(xp: number): CurrentLevelCalculation {
  let currentLevel = LEVELS[0];
  let index = 0;

  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) {
      currentLevel = LEVELS[i];
      index = i;
    }
  }

  const nextLevel = LEVELS[index + 1];
  const nextMin = nextLevel ? nextLevel.min : null;
  const progress = nextMin ? Math.min(100, Math.max(0, ((xp - currentLevel.min) / (nextMin - currentLevel.min)) * 100)) : 100;

  return {
    ...currentLevel,
    index,
    progress,
    nextMin,
  };
}

export function fireConfetti(): void {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e'],
    });
  } catch (e) {
    console.warn('Confetti error:', e);
  }
}

export function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
