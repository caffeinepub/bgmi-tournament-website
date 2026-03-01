import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Trophy, LogOut, User, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { isAuthenticated, player, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50" style={{ background: 'oklch(0.08 0 0)', borderBottom: '1px solid oklch(0.65 0.22 45 / 0.3)' }}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 shrink-0">
          <img
            src="/assets/generated/raj-empire-esports-logo.dim_400x120.png"
            alt="Raj Empire Esports"
            className="h-10 w-auto object-contain"
          />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate({ to: '/' })}
            className="font-saira font-semibold text-sm tracking-widest uppercase transition-colors"
            style={{ color: 'oklch(0.75 0.02 60)' }}
          >
            Tournaments
          </button>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate({ to: '/player/dashboard' })}
                className="font-saira font-semibold text-sm tracking-widest uppercase transition-colors"
                style={{ color: 'oklch(0.75 0.02 60)' }}
              >
                Dashboard
              </button>
              <div className="flex items-center gap-3">
                <span className="font-rajdhani text-sm" style={{ color: 'oklch(0.65 0.22 45)' }}>
                  {player?.displayName}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="font-saira tracking-wider uppercase text-xs"
                  style={{ borderColor: 'oklch(0.65 0.22 45)', color: 'oklch(0.65 0.22 45)' }}
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/player/login' })}
                className="font-saira tracking-wider uppercase text-xs"
                style={{ color: 'oklch(0.75 0.02 60)' }}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate({ to: '/player' })}
                className="font-saira tracking-wider uppercase text-xs"
                style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)', fontWeight: 700 }}
              >
                Register
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: 'oklch(0.65 0.22 45)' }}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ background: 'oklch(0.10 0 0)', borderColor: 'oklch(0.65 0.22 45 / 0.3)' }}>
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <button
              onClick={() => { navigate({ to: '/' }); setMenuOpen(false); }}
              className="font-saira font-semibold text-sm tracking-widest uppercase text-left"
              style={{ color: 'oklch(0.75 0.02 60)' }}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Tournaments
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { navigate({ to: '/player/dashboard' }); setMenuOpen(false); }}
                  className="font-saira font-semibold text-sm tracking-widest uppercase text-left"
                  style={{ color: 'oklch(0.75 0.02 60)' }}
                >
                  <LayoutDashboard className="w-4 h-4 inline mr-2" />
                  Dashboard
                </button>
                <div className="flex items-center justify-between">
                  <span className="font-rajdhani text-sm" style={{ color: 'oklch(0.65 0.22 45)' }}>
                    <User className="w-4 h-4 inline mr-1" />
                    {player?.displayName}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="font-saira tracking-wider uppercase text-xs"
                    style={{ borderColor: 'oklch(0.65 0.22 45)', color: 'oklch(0.65 0.22 45)' }}
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { navigate({ to: '/player/login' }); setMenuOpen(false); }}
                  className="flex-1 font-saira tracking-wider uppercase text-xs"
                  style={{ borderColor: 'oklch(0.65 0.22 45)', color: 'oklch(0.65 0.22 45)' }}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => { navigate({ to: '/player' }); setMenuOpen(false); }}
                  className="flex-1 font-saira tracking-wider uppercase text-xs"
                  style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)', fontWeight: 700 }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
