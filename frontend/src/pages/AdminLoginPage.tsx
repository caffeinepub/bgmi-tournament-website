import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Loader2, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAdminAuthenticated, adminLogin } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate({ to: '/admin/dashboard' });
    }
  }, [isAdminAuthenticated]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const success = adminLogin(username, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    } else {
      navigate({ to: '/admin/dashboard' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/generated/raj-empire-esports-logo.dim_400x120.png" alt="Raj Empire Esports" className="h-16 object-contain mx-auto mb-4" />
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-rajdhani text-sm uppercase tracking-widest">Admin Panel</span>
          </div>
        </div>

        <div className="bg-card border border-border p-8">
          <h1 className="font-orbitron font-bold text-xl text-primary uppercase tracking-widest mb-6 text-center">
            Admin Login
          </h1>

          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive font-saira text-sm px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="font-rajdhani font-semibold text-foreground text-sm uppercase tracking-wider block mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Admin username"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-background border border-border px-4 py-3 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="font-rajdhani font-semibold text-foreground text-sm uppercase tracking-wider block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Admin password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-background border border-border px-4 py-3 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-rajdhani font-bold py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Login
            </button>
          </div>
        </div>

        <p className="text-center mt-6 font-saira text-xs text-muted-foreground">
          <button onClick={() => navigate({ to: '/' })} className="hover:text-primary transition-colors">← Back to Home</button>
        </p>
      </div>
    </div>
  );
}
