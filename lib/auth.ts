const PASSWORD_HASH_KEY = 'asmile-admin-hash';
const SESSION_KEY = 'asmile-admin-session';
const ATTEMPTS_KEY = 'asmile-admin-attempts';
const LOCKOUT_KEY = 'asmile-admin-lockout';

const DEFAULT_PASSWORD = 'admin123';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300000; // 5 minutes

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getAttempts(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
}

function incrementAttempts(): number {
  const current = getAttempts() + 1;
  localStorage.setItem(ATTEMPTS_KEY, current.toString());
  return current;
}

function resetAttempts(): void {
  localStorage.removeItem(ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}

function isLockedOut(): boolean {
  if (typeof window === 'undefined') return false;
  const lockout = localStorage.getItem(LOCKOUT_KEY);
  if (!lockout) return false;
  const lockoutEnd = parseInt(lockout, 10);
  if (Date.now() > lockoutEnd) {
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
    return false;
  }
  return true;
}

function getLockoutRemaining(): number {
  if (typeof window === 'undefined') return 0;
  const lockout = localStorage.getItem(LOCKOUT_KEY);
  if (!lockout) return 0;
  const remaining = parseInt(lockout, 10) - Date.now();
  return remaining > 0 ? remaining : 0;
}

function applyLockout(): void {
  localStorage.setItem(LOCKOUT_KEY, (Date.now() + LOCKOUT_DURATION).toString());
}

function getStoredHash(): string {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem(PASSWORD_HASH_KEY);
  return stored || '';
}

async function initializeDefaultHash(): Promise<void> {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(PASSWORD_HASH_KEY);
  if (!stored) {
    const hash = await hashPassword(DEFAULT_PASSWORD);
    localStorage.setItem(PASSWORD_HASH_KEY, hash);
  }
}

function isUsingDefaultPasswordSync(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(PASSWORD_HASH_KEY);
  if (!stored) return true;
  return stored === localStorage.getItem('_asmile_default_hash_ref');
}

async function isUsingDefaultPassword(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(PASSWORD_HASH_KEY);
  if (!stored) return true;
  const defaultHash = await hashPassword(DEFAULT_PASSWORD);
  return stored === defaultHash;
}

async function verifyPassword(password: string): Promise<{ ok: boolean; error?: string; lockoutRemaining?: number }> {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'Server-side verification not available' };
  }

  if (isLockedOut()) {
    const remaining = Math.ceil(getLockoutRemaining() / 1000);
    return {
      ok: false,
      error: `Too many failed attempts. Try again in ${Math.floor(remaining / 60)}m ${remaining % 60}s.`,
      lockoutRemaining: remaining,
    };
  }

  await initializeDefaultHash();

  const hash = await hashPassword(password);
  const storedHash = getStoredHash();

  if (hash === storedHash) {
    resetAttempts();
    return { ok: true };
  }

  const attempts = incrementAttempts();
  if (attempts >= MAX_ATTEMPTS) {
    applyLockout();
    const remaining = Math.ceil(LOCKOUT_DURATION / 1000);
    return {
      ok: false,
      error: `Account locked for ${Math.floor(remaining / 60)} minutes due to too many failed attempts.`,
      lockoutRemaining: remaining,
    };
  }

  const remaining = MAX_ATTEMPTS - attempts;
  return {
    ok: false,
    error: `Invalid password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
  };
}

async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { ok: false, error: 'New password must be at least 8 characters' };
  }
  if (newPassword === currentPassword) {
    return { ok: false, error: 'New password must be different from current' };
  }
  const result = await verifyPassword(currentPassword);
  if (!result.ok) {
    return { ok: false, error: result.error || 'Current password is incorrect' };
  }
  const newHash = await hashPassword(newPassword);
  localStorage.setItem(PASSWORD_HASH_KEY, newHash);
  resetAttempts();
  return { ok: true };
}

function setAdminSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, 'authenticated');
  }
}

function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_KEY) === 'authenticated';
}

export {
  hashPassword,
  verifyPassword,
  changePassword,
  setAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
  isUsingDefaultPassword,
  initializeDefaultHash,
  isLockedOut,
  getLockoutRemaining,
};
