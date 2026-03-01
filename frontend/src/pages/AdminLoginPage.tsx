import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Shield, Eye, EyeOff, Lock, User, CheckCircle, AlertCircle } from 'lucide-react';

// Phase 1 credentials
const PHASE1_ID = 'Empire Esports';
const PHASE1_PASSWORD = 'Shivam803119&';

// Phase 2 credentials
const PHASE2_ID = '6299724471';
const PHASE2_PASSWORD = '6202497864';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin, isAdminAuthenticated } = useAdminAuth();

  // Phase tracking
  const [phase, setPhase] = useState<1 | 2>(1);

  // Phase 1 state
  const [phase1Id, setPhase1Id] = useState('');
  const [phase1Password, setPhase1Password] = useState('');
  const [showPhase1Password, setShowPhase1Password] = useState(false);
  const [phase1Error, setPhase1Error] = useState('');

  // Phase 2 state
  const [phase2Id, setPhase2Id] = useState('');
  const [phase2Password, setPhase2Password] = useState('');
  const [showPhase2Password, setShowPhase2Password] = useState(false);
  const [phase2Error, setPhase2Error] = useState('');

  // Redirect when authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate({ to: '/admin/dashboard' });
    }
  }, [isAdminAuthenticated, navigate]);

  const handlePhase1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase1Error('');
    if (phase1Id === PHASE1_ID && phase1Password === PHASE1_PASSWORD) {
      setPhase(2);
    } else {
      setPhase1Error('Invalid Admin ID or Password. Please try again.');
    }
  };

  const handlePhase2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase2Error('');
    if (phase2Id === PHASE2_ID && phase2Password === PHASE2_PASSWORD) {
      adminLogin();
    } else {
      setPhase2Error('Invalid Admin ID or Password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-red to-brand-orange shadow-lg shadow-brand-red/30 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-orbitron font-bold text-white text-2xl">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Raj Empire Esports Arena</p>
        </div>

        {/* Phase Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            phase > 1
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-brand-red/20 text-brand-orange border border-brand-red/30'
          }`}>
            {phase > 1 ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-brand-orange flex items-center justify-center text-[10px] font-bold text-white">1</span>
            )}
            Phase 1
          </div>
          <div className="w-6 h-px bg-white/20" />
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            phase === 2
              ? 'bg-brand-red/20 text-brand-orange border border-brand-red/30'
              : 'bg-white/5 text-gray-500 border border-white/10'
          }`}>
            <span className="w-3.5 h-3.5 rounded-full bg-current flex items-center justify-center text-[10px] font-bold text-white">2</span>
            Phase 2
          </div>
        </div>

        <div className="bg-brand-dark border border-brand-red/20 rounded-2xl p-6 shadow-xl">
          {/* PHASE 1 */}
          {phase === 1 && (
            <div>
              <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-orange" />
                Phase 1: Admin Verification
              </h2>
              <form onSubmit={handlePhase1Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Admin ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={phase1Id}
                      onChange={(e) => setPhase1Id(e.target.value)}
                      placeholder="Enter Admin ID"
                      autoComplete="off"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPhase1Password ? 'text' : 'password'}
                      value={phase1Password}
                      onChange={(e) => setPhase1Password(e.target.value)}
                      placeholder="Enter Password"
                      autoComplete="off"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPhase1Password(!showPhase1Password)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPhase1Password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {phase1Error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {phase1Error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-red/20"
                >
                  <Shield className="w-4 h-4" />
                  Continue to Phase 2
                </button>
              </form>
            </div>
          )}

          {/* PHASE 2 */}
          {phase === 2 && (
            <div>
              <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-orange" />
                Phase 2: Final Verification
              </h2>
              <form onSubmit={handlePhase2Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Admin ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={phase2Id}
                      onChange={(e) => setPhase2Id(e.target.value)}
                      placeholder="Enter Admin ID"
                      autoComplete="off"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPhase2Password ? 'text' : 'password'}
                      value={phase2Password}
                      onChange={(e) => setPhase2Password(e.target.value)}
                      placeholder="Enter Password"
                      autoComplete="off"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPhase2Password(!showPhase2Password)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPhase2Password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {phase2Error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {phase2Error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-red/20"
                >
                  <Shield className="w-4 h-4" />
                  Access Admin Panel
                </button>
              </form>

              <button
                onClick={() => {
                  setPhase(1);
                  setPhase2Id('');
                  setPhase2Password('');
                  setPhase2Error('');
                }}
                className="w-full mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors py-2"
              >
                ← Back to Phase 1
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Admin access is restricted. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
