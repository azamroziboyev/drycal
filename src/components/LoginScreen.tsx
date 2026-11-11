import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff, Send } from 'lucide-react';
import { UzNimLogo } from './UzNimLogo';
import { recordAuditLog, setAuthSession } from '../utils/storage';
import { authenticateWithGoogleSheets } from '../utils/googleSheetsAuth';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Authenticate with live Google Sheets database
      const result = await authenticateWithGoogleSheets(username, password);

      if (result.success && result.user) {
        const displayName = result.user.fullName || result.user.username;
        const role = result.user.role || 'Mutaxassis';

        recordAuditLog(
          result.user.username,
          'Muvaffaqiyatli',
          `${displayName} (${role}) - Google Sheets orqali tasdiqlandi`
        );
        setAuthSession(displayName, rememberMe);
        setIsLoading(false);
        onLoginSuccess(displayName);
        return;
      }

      // 2. Local fallback for offline/development test
      if (username.trim().toLowerCase() === 'metrologiya' && password === '12345') {
        recordAuditLog('metrologiya', 'Muvaffaqiyatli', 'Tizimga kirish tasdiqlandi (Lokal zaxira)');
        setAuthSession('metrologiya', rememberMe);
        setIsLoading(false);
        onLoginSuccess('metrologiya');
        return;
      }

      // 3. Show exact error message from Google Sheets Apps Script
      setIsLoading(false);
      setErrorMessage(result.message || 'Login yoki parol noto‘g‘ri!');
      recordAuditLog(
        username || 'Nomaʼlum',
        'Xato parol',
        `Noto'g'ri urinish: login='${username}', xabar='${result.message}'`
      );
    } catch (err: any) {
      console.error('Login xatosi:', err);
      // Local fallback
      if (username.trim().toLowerCase() === 'metrologiya' && password === '12345') {
        setAuthSession('metrologiya', rememberMe);
        setIsLoading(false);
        onLoginSuccess('metrologiya');
        return;
      }
      setIsLoading(false);
      setErrorMessage('Google Sheets bilan bog‘lanishda xatolik yuz berdi. Qaytadan urinib ko‘ring.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 inline-flex items-center justify-center">
                <UzNimLogo size={60} />
              </div>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              O‘zbekiston Milliy Metrologiya Instituti
            </h1>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-1 uppercase tracking-wider">
              Kalibrlash Sertifikatlari va Noaniqlik Tizimi
            </p>
          </div>

          {/* Error notification */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Kirish rad etildi</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label 
                htmlFor="username-input" 
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Foydalanuvchi logini (Google Sheets)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masalan: alibey34"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password-input" 
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting"
                  autoComplete="off"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Parolni berkitish" : "Parolni ko'rsatish"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Eslab qolish
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all cursor-pointer"
            >
              {isLoading ? (
                <span>Tekshirilmoqda...</span>
              ) : (
                <>
                  <span>Tizimga kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Admin bilan bog'lanish */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
              saytga kirish uchun admin bilan bog'laning
            </p>
            <a
              href="https://t.me/boburjon_565"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#229ED9] hover:bg-[#1E88E5] active:bg-[#1976D2] transition-colors shadow-sm shadow-[#229ED9]/25 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Bog‘lanish</span>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-5 text-xs text-slate-500 dark:text-slate-400">
          <p>Kalibrlash laboratoriyasi avtomatlashtirilgan axborot tizimi</p>
        </div>
      </div>
    </div>
  );
};
