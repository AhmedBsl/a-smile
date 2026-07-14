'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { changePassword, isUsingDefaultPassword } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Download, Upload, Lock, Globe, Eye, EyeOff } from 'lucide-react';

export default function AdminSettingsPage() {
  const backup = useStore((state) => state.backup);
  const restore = useStore((state) => state.restore);

  const [restoreMessage, setRestoreMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [usingDefault, setUsingDefault] = useState(false);

  useEffect(() => {
    isUsingDefaultPassword().then(setUsingDefault);
  }, []);

  const handleBackup = () => {
    const data = backup();
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:application/json;charset=utf-8,' + encodeURIComponent(data)
    );
    element.setAttribute('download', `asmile-backup-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (restore(content)) {
        setRestoreMessage('تمت استعادة البيانات بنجاح!');
        setPasswordError(false);
      } else {
        setRestoreMessage('فشلت الاستعادة — ملف النسخ الاحتياطي غير صالح.');
        setPasswordError(true);
      }
      setTimeout(() => setRestoreMessage(''), 4000);
    };
    reader.readAsText(file);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    if (newPassword !== confirmPassword) {
      setPasswordMessage('كلمة المرور الجديدة غير متطابقة');
      setPasswordError(true);
      return;
    }
    const result = await changePassword(currentPassword, newPassword);
    if (result.ok) {
      setPasswordMessage('تم تحديث كلمة المرور بنجاح');
      setPasswordError(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setUsingDefault(false);
    } else {
      setPasswordMessage(result.error || 'فشل تحديث كلمة المرور');
      setPasswordError(true);
    }
  };

  return (
    <AdminPageShell title="الإعدادات" subtitle="معلومات المتجر، الأمان، والنسخ الاحتياطي.">
      {usingDefault && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-sm text-sm font-semibold">
          لا تزال تستخدم كلمة المرور الافتراضية. قم بتغييرها أدناه.
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        <section className="bg-card border border-border rounded-sm p-5">
          <h2 className="font-black flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            معلومات المتجر
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                اسم المتجر
              </label>
              <input
                type="text"
                defaultValue="MELINA CHIC"
                readOnly
                className="w-full px-4 py-2 border border-border rounded-sm bg-muted/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                العملة
              </label>
              <input
                type="text"
                defaultValue="د.ج (دينار جزائري)"
                readOnly
                className="w-full px-4 py-2 border border-border rounded-sm bg-muted/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                الدفع
              </label>
              <input
                type="text"
                defaultValue="الدفع عند الاستلام (COD)"
                readOnly
                className="w-full px-4 py-2 border border-border rounded-sm bg-muted/50"
              />
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-sm p-5">
          <h2 className="font-black flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            تغيير كلمة المرور
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                  {field === 'currentPassword'
                    ? 'كلمة المرور الحالية'
                    : field === 'newPassword'
                      ? 'كلمة المرور الجديدة'
                      : 'تأكيد كلمة المرور الجديدة'}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={
                      field === 'currentPassword'
                        ? currentPassword
                        : field === 'newPassword'
                          ? newPassword
                          : confirmPassword
                    }
                    onChange={(e) => {
                      if (field === 'currentPassword') setCurrentPassword(e.target.value);
                      else if (field === 'newPassword') setNewPassword(e.target.value);
                      else setConfirmPassword(e.target.value);
                    }}
                    className="w-full px-4 py-2 pr-10 border border-border rounded-sm bg-background font-mono"
                    autoComplete="off"
                  />
                  {field === 'currentPassword' && (
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {passwordMessage && (
              <p
                className={`text-sm font-semibold ${passwordError ? 'text-destructive' : 'text-venom'}`}
              >
                {passwordMessage}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2.5 font-bold rounded-sm hover:bg-redDim transition-colors"
            >
              تحديث كلمة المرور
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            يتم تخزين كلمة المرور بشكل مشفر في متصفحك — وليس كنص عادي. المصادقة من جانب العميل مناسبة لمتجر تجريبي بمالك واحد، وليس للبيئات عالية الأمان.
          </p>
        </section>

        <section className="bg-card border border-border rounded-sm p-5">
          <h2 className="font-black flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-primary" />
            النسخ الاحتياطي والاستعادة
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            تصدير جميع المنتجات والطلبات بصيغة JSON. الاستعادة تحل محل البيانات الحالية.
          </p>
          <div className="space-y-3">
            <motion.button
              type="button"
              onClick={handleBackup}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 font-bold rounded-sm"
            >
              <Download className="w-4 h-4" />
              تحميل نسخة احتياطية كاملة
            </motion.button>
            <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border py-2.5 font-bold rounded-sm hover:border-primary cursor-pointer text-sm">
              <Upload className="w-4 h-4" />
              استعادة من نسخة احتياطية
              <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
            </label>
            {restoreMessage && (
              <p
                className={`text-sm font-semibold text-center ${restoreMessage.includes('نجاح') ? 'text-venom' : 'text-destructive'}`}
              >
                {restoreMessage}
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminPageShell>
  );
}
