'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { verifyPassword, setAdminSession } from '@/lib/auth';
import { BrandLogo } from './brand-logo';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await verifyPassword(password);
      if (result.ok) {
        setAdminSession();
        setPassword('');
        window.location.href = '/admin';
      } else {
        setError(result.error || 'كلمة المرور غير صحيحة');
        setPassword('');
        if (result.lockoutRemaining) {
          setLockoutTimer(result.lockoutRemaining);
        }
      }
    } catch {
      setError('فشل التحقق. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || lockoutTimer > 0;

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 overflow-hidden -z-10 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 12 C 20 40, 20 70, 42 88 C 30 70, 34 50, 50 38 C 66 50, 70 70, 58 88 C 80 70, 80 40, 50 12 Z' fill='%23C1272D'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <motion.button
        onClick={() => (window.location.href = '/')}
        whileHover={{ scale: 1.05, x: -4 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-sm text-sand/70 hover:text-sand hover:bg-white/5 transition-colors"
        title="العودة للرئيسية"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold hidden sm:inline">رجوع</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-charcoal2 border border-white/10 rounded-sm shadow-2xl p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <BrandLogo size="lg" showGlow />
            </div>
            <h1 className="text-3xl font-black text-sand mb-2 tracking-tight">
              لوحة التحكم
            </h1>
            <p className="text-sand/50 text-sm font-mono">
              أدخل كلمة المرور للمتابعة
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <label className="block text-sm font-bold text-sand/80 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lockoutTimer > 0 ? `مقفل — ${formatTime(lockoutTimer)}` : '••••••••'}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 bg-charcoal border border-white/10 rounded-sm text-sand placeholder-sand/30 focus:border-primary focus:outline-none transition-colors font-mono disabled:opacity-50"
                  disabled={isDisabled}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sand/40 hover:text-sand transition-colors"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  disabled={isDisabled}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/30 rounded-sm text-sm text-primary font-medium"
              >
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={!isDisabled ? { scale: 1.02 } : undefined}
              whileTap={!isDisabled ? { scale: 0.98 } : undefined}
              type="submit"
              disabled={isDisabled || password.length === 0}
              className="w-full bg-primary text-white py-3 rounded-sm font-black text-lg hover:bg-redDim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جارٍ التحقق...' : lockoutTimer > 0 ? `مقفل — ${formatTime(lockoutTimer)}` : 'فتح لوحة التحكم'}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-xs text-sand/30 font-mono"
          >
            <p>منطقة محمية بكلمة مرور</p>
            <p className="mt-1">مشفّر بـ SHA-256 ومحمي من التخمين</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
