import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/hooks';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isRegisterMode && !fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      if (isRegisterMode) {
        await register({ email: email.trim(), password, full_name: fullName.trim() });
      } else {
        await login(email.trim(), password);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700/80 shadow-2xl p-6 text-white relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in dialog"
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg transition"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-teal-600/20 text-teal-400 border border-teal-500/30 mb-3">
            <ShieldCheck className="w-8 h-8" aria-hidden="true" />
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-black">
            {isRegisterMode ? 'Join ClearSky AI' : 'Sign In to ClearSky'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Access personalized family routines, track community actions, and view your impact.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label htmlFor="auth-full-name" className="block text-xs font-semibold text-neutral-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" aria-hidden="true" />
                <input
                  id="auth-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Arjun Nair"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-neutral-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold text-neutral-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" aria-hidden="true" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-sm text-white transition shadow-lg shadow-teal-900/40 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isRegisterMode ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-neutral-800 text-center">
          <p className="text-[11px] text-neutral-400">
            First-time deployments provision administrator access via environment configuration or the first registered account.
          </p>
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-xs text-teal-400 hover:underline"
          >
            {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
