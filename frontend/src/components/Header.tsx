import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Menu, X, Gamepad2, Trophy, Home, Info, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, player } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', icon: <Home size={16} />, path: '/' as const },
    { label: 'Terms', icon: <Info size={16} />, path: '/terms' as const },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-brand">
      <div className="bg-brand-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Gamepad2 size={22} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-heading font-bold text-lg leading-tight block">
                  Raj Empire
                </span>
                <span className="text-white/80 text-xs font-medium tracking-wider uppercase">
                  Esports
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate({ to: item.path })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all text-sm font-medium"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => navigate({ to: '/' })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all text-sm font-medium"
              >
                <Trophy size={16} />
                Tournaments
              </button>
            </nav>

            {/* Auth Actions */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate({ to: '/player/dashboard' })}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-all"
                  >
                    <User size={16} />
                    {player?.displayName || 'Dashboard'}
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate({ to: '/player/login' })}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-all"
                  >
                    <User size={16} />
                    Login
                  </button>
                  <button
                    onClick={() => navigate({ to: '/player' })}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-brand-red hover:bg-white/90 text-sm font-bold transition-all shadow-sm"
                  >
                    Register
                  </button>
                </>
              )}
              <button
                onClick={() => navigate({ to: '/admin' })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 hover:bg-black/30 text-white/80 hover:text-white text-xs font-medium transition-all"
                title="Admin Panel"
              >
                <Shield size={14} />
                Admin
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-black/20 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate({ to: item.path }); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all text-sm font-medium"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { navigate({ to: '/' }); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all text-sm font-medium"
              >
                <Trophy size={16} />
                Tournaments
              </button>
              <div className="pt-2 border-t border-white/20 space-y-1">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => { navigate({ to: '/player/dashboard' }); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white/15 text-white text-sm font-medium"
                    >
                      <User size={16} />
                      {player?.displayName || 'Dashboard'}
                    </button>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white/10 text-white text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate({ to: '/player/login' }); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white/15 text-white text-sm font-medium"
                    >
                      <User size={16} />
                      Login
                    </button>
                    <button
                      onClick={() => { navigate({ to: '/player' }); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white text-brand-red text-sm font-bold"
                    >
                      Register
                    </button>
                  </>
                )}
                <button
                  onClick={() => { navigate({ to: '/admin' }); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-black/20 text-white/80 text-sm font-medium"
                >
                  <Shield size={16} />
                  Admin Panel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
