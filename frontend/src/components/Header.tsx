import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Gamepad2, Trophy, LogOut, User } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, player, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-dark/95 backdrop-blur-sm border-b border-brand-red/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-red to-brand-orange flex items-center justify-center shadow-md group-hover:shadow-brand-red/40 transition-shadow">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-orbitron font-bold text-white text-sm leading-tight block">RAJ EMPIRE</span>
              <span className="font-orbitron text-brand-orange text-xs leading-tight block">ESPORTS ARENA</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate({ to: '/tournaments' })}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
            >
              <Trophy className="w-4 h-4" />
              Tournaments
            </button>
            <button
              onClick={() => navigate({ to: '/terms' })}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
            >
              Terms
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate({ to: '/player' })}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
                >
                  <User className="w-4 h-4" />
                  {player?.displayName || 'Dashboard'}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate({ to: '/player/login' })}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate({ to: '/player/register' })}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-brand-red to-brand-orange text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                >
                  Register
                </button>
              </>
            )}
            {/* Admin link - intentionally subtle so regular users overlook it */}
            <button
              onClick={() => navigate({ to: '/admin' })}
              className="px-2 py-1 text-[10px] text-gray-600 hover:text-gray-400 transition-colors rounded"
            >
              Admin
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-dark border-t border-brand-red/20 px-4 py-3 space-y-1">
          <button
            onClick={() => { navigate({ to: '/tournaments' }); setMobileOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-left"
          >
            <Trophy className="w-4 h-4" /> Tournaments
          </button>
          <button
            onClick={() => { navigate({ to: '/terms' }); setMobileOpen(false); }}
            className="w-full px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-left"
          >
            Terms
          </button>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => { navigate({ to: '/player' }); setMobileOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-left"
              >
                <User className="w-4 h-4" /> {player?.displayName || 'Dashboard'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-left"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate({ to: '/player/login' }); setMobileOpen(false); }}
                className="w-full px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-left"
              >
                Login
              </button>
              <button
                onClick={() => { navigate({ to: '/player/register' }); setMobileOpen(false); }}
                className="w-full px-3 py-2.5 text-sm font-semibold bg-gradient-to-r from-brand-red to-brand-orange text-white rounded-lg hover:opacity-90 transition-opacity text-left"
              >
                Register
              </button>
            </>
          )}
          {/* Admin link - subtle in mobile menu too */}
          <button
            onClick={() => { navigate({ to: '/admin' }); setMobileOpen(false); }}
            className="w-full px-3 py-1.5 text-[10px] text-gray-600 hover:text-gray-400 transition-colors text-left"
          >
            Admin
          </button>
        </div>
      )}
    </header>
  );
}
