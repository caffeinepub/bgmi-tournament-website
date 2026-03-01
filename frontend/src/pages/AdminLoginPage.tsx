import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAdminAuthenticated, adminLogin } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate({ to: '/admin/dashboard' });
    }
  }, [isAdminAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const success = adminLogin(username, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    } else {
      navigate({ to: '/admin/dashboard' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-brand mb-4"
            style={{ background: 'linear-gradient(135deg, oklch(0.42 0.24 18), oklch(0.52 0.24 22))' }}
          >
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Raj Empire Esports — Admin Access</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-brand-sm overflow-hidden">
          {/* Header */}
          <div
            className="p-4 text-center"
            style={{ background: 'linear-gradient(90deg, oklch(0.42 0.24 18), oklch(0.52 0.24 22))' }}
          >
            <p className="text-white/90 text-sm font-medium">🔒 Restricted Access — Authorized Personnel Only</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Admin username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Admin password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-base hover:opacity-90 transition-all shadow-brand disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, oklch(0.42 0.24 18), oklch(0.52 0.24 22))' }}
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Logging in...</> : <><Shield size={18} /> Login to Admin Panel</>}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-border text-center">
              <button
                onClick={() => navigate({ to: '/' })}
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
