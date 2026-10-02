import React, { useState } from 'react';
import { UserProfile } from '../types/fitness';
import { Zap, ShieldCheck } from 'lucide-react';
import { fireConfetti } from '../utils/helpers';

interface AuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.length < 2) {
      setError('الرجاء إدخال اسمك الكريم بشكل صحيح');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }
    if (password.length < 4) {
      setError('كلمة المرور يجب أن لا تقل عن 4 خانات');
      return;
    }

    setError('');
    const user: UserProfile = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      join: new Date().toISOString(),
    };

    fireConfetti();
    onLoginSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-sky-600/90 via-sky-500/90 to-teal-500/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center mx-auto text-white shadow-lg shadow-sky-500/25">
          <Zap className="w-7 h-7 fill-white" />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">لياقة+</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            النسخة الشاملة — ابدأ رحلتك لتحقيق جسم أحلامك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          {error && (
            <div className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl">
              {error}
            </div>
          )}

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم الكامل"
            required
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            required
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور (4+ خانات)"
            required
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 text-white font-black text-sm shadow-lg shadow-sky-500/25 hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🚀 انطلق في رحلتك الآن</span>
          </button>
        </form>

        <div className="pt-2 flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>بياناتك وتطوراتك محفوظة بأمان تام</span>
        </div>
      </div>
    </div>
  );
};
