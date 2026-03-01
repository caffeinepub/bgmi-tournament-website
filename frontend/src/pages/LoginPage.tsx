import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Phone, KeyRound, ArrowRight, Gamepad2 } from 'lucide-react';
import { useGenerateOtp, useVerifyOtp } from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';
import { useActor } from '../hooks/useActor';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      if (!actor) throw new Error('Not connected');
      const otpVal = await actor.generateOtp();
      setGeneratedOtp(otpVal);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      if (!actor) throw new Error('Not connected');
      const valid = await actor.verifyOtp(otp);
      if (!valid) {
        setError('Invalid OTP. Please try again.');
        setLoading(false);
        return;
      }
      // Try to fetch profile
      let displayName = 'Player';
      let bgmiPlayerId = '';
      try {
        const profile = await actor.getCallerUserProfile();
        if (profile) {
          displayName = profile.displayName;
          bgmiPlayerId = profile.bgmiPlayerId;
        }
      } catch {
        // ignore
      }
      login({ mobile, displayName, bgmiPlayerId });
      navigate({ to: '/player/dashboard' });
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gradient shadow-brand mb-4">
            <Gamepad2 size={32} className="text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">Login to your Raj Empire account</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-brand-sm overflow-hidden">
          {/* Step Indicator */}
          <div className="bg-brand-gradient p-4">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 text-sm font-medium ${step === 'phone' ? 'text-white' : 'text-white/60'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'phone' ? 'bg-white text-brand-red' : 'bg-white/30 text-white'}`}>
                  1
                </div>
                Mobile Number
              </div>
              <ArrowRight size={16} className="text-white/50" />
              <div className={`flex items-center gap-2 text-sm font-medium ${step === 'otp' ? 'text-white' : 'text-white/60'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'otp' ? 'bg-white text-brand-red' : 'bg-white/30 text-white'}`}>
                  2
                </div>
                Verify OTP
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter your 10-digit mobile number"
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !actor}
                  className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-base hover:opacity-90 transition-all shadow-brand disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Sending OTP...</>
                  ) : (
                    <>Send OTP <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Enter OTP
                  </label>
                  <p className="text-muted-foreground text-xs mb-3">
                    OTP sent to +91 {mobile}
                  </p>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter OTP"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors text-center text-xl tracking-widest font-bold"
                    />
                  </div>
                  {generatedOtp && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Demo OTP: <span className="text-brand-red font-bold">{generatedOtp}</span>
                    </p>
                  )}
                </div>
                {error && (
                  <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-base hover:opacity-90 transition-all shadow-brand disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                  ) : (
                    <>Verify &amp; Login <ArrowRight size={18} /></>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Change mobile number
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-muted-foreground text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate({ to: '/player' })}
                  className="text-brand-red font-semibold hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
