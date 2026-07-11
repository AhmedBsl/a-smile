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
        setRestoreMessage('Data restored successfully!');
        setPasswordError(false);
      } else {
        setRestoreMessage('Failed to restore — invalid backup file.');
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
      setPasswordMessage('New passwords do not match');
      setPasswordError(true);
      return;
    }
    const result = await changePassword(currentPassword, newPassword);
    if (result.ok) {
      setPasswordMessage('Password updated successfully');
      setPasswordError(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setUsingDefault(false);
    } else {
      setPasswordMessage(result.error || 'Failed to update password');
      setPasswordError(true);
    }
  };

  return (
    <AdminPageShell title="Settings" subtitle="Store info, security, and backups.">
      {usingDefault && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-sm text-sm font-semibold">
          You&apos;re still using the default starter password. Change it below.
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        <section className="bg-card border border-border rounded-sm p-5">
          <h2 className="font-black flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            Store Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                Store Name
              </label>
              <input
                type="text"
                defaultValue="A.SMILE"
                readOnly
                className="w-full px-4 py-2 border border-border rounded-sm bg-muted/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                Currency
              </label>
              <input
                type="text"
                defaultValue="DZD (Algerian Dinar)"
                readOnly
                className="w-full px-4 py-2 border border-border rounded-sm bg-muted/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                Payment
              </label>
              <input
                type="text"
                defaultValue="Cash on Delivery (COD)"
                readOnly
                className="w-full px-4 py-2 border border-border rounded-sm bg-muted/50"
              />
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-sm p-5">
          <h2 className="font-black flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                  {field === 'currentPassword'
                    ? 'Current Password'
                    : field === 'newPassword'
                      ? 'New Password'
                      : 'Confirm New Password'}
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
              Update Password
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            Password is stored as a hash in your browser — never as plain text. Client-side
            auth is suitable for a single-owner demo store, not high-security environments.
          </p>
        </section>

        <section className="bg-card border border-border rounded-sm p-5">
          <h2 className="font-black flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-primary" />
            Backup & Restore
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Export all products and orders as JSON. Restore replaces current data.
          </p>
          <div className="space-y-3">
            <motion.button
              type="button"
              onClick={handleBackup}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 font-bold rounded-sm"
            >
              <Download className="w-4 h-4" />
              Download Full Backup
            </motion.button>
            <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border py-2.5 font-bold rounded-sm hover:border-primary cursor-pointer text-sm">
              <Upload className="w-4 h-4" />
              Restore from Backup
              <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
            </label>
            {restoreMessage && (
              <p
                className={`text-sm font-semibold text-center ${restoreMessage.includes('success') ? 'text-venom' : 'text-destructive'}`}
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
