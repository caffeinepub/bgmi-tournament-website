import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, User, Phone, Gamepad2, ArrowRight, CheckCircle } from 'lucide-react';
import { useRegisterPlayer } from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';
import { useActor } from '../hooks/useActor';

type Step = 'details' | 'otp' | 'success';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();
  const [step, setStep] = useState<Step>('details');
  const [form, setForm] = useState({ displayName: '', mobile: '', bgmiPlayerId: '' });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const registerPlayer = useRegisterPlayer();

  const handleDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.displayName.trim()) { setError('Display name is required'); return; }
    if (!form.mobile || form.mobile.length < 10) { setError('Valid 10-digit mobile number required'); return; }
    if (!form.bgmiPlayerId.trim()) { setError('BGMI Player ID is required'); return; }
    setOtpLoading(true);
    try {
      if (!actor) throw new Error('Not connected');
      const otpVal = await actor.generateOtp();
      setGeneratedOtp(otpVal);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length < 4) { setError('Please enter the OTP'); return; }
    setVerifyLoading(true);
    try {
      if (!actor) throw new Error('Not connected');
      const valid = await actor.verifyOtp(otp);
      if (!valid) { setError('Invalid OTP. Please try again.'); setVerifyLoading(false); return; }
      await registerPlayer.mutateAsync({ mobile: form.mobile, bgmiPlayerId: form.bgmiPlayerId, displayName: form.displayName });
      login({ mobile: form.mobile, displayName: form.displayName, bgmiPlayerId: form.bgmiPlayerId });
      setStep('success');
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        setError('This account already exists. Please login instead.');
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const steps = ['details', 'otp', 'success'];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gradient shadow-brand mb-4">
            <Gamepad2 size={32} className="text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-1">Join Raj Empire Esports today</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-brand-sm overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-brand-gradient p-4">
            <div className="flex items-center justify-between">
              {['Player Details', 'Verify OTP', 'Done!'].map((label, i) => (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-2 text-xs font-medium ${i <= stepIdx ? 'text-white' : 'text-white/50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < stepIdx ? 'bg-white text-brand-red' :
                      i === stepIdx ? 'bg-white text-brand-red' :
                      'bg-white/20 text-white'
                    }`}>
                      {i < stepIdx ? '✓' : i + 1}
                    </div>
                    <span className="hidden sm:block">{label}</span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 mx-2 ${i < stepIdx ? 'bg-white' : 'bg-white/30'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-6">
            {step === 'details' && (
              <form onSubmit={handleDetails} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                      placeholder="Your in-game name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mobile Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      value={form.mobile}
                      onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">BGMI Player ID</label>
                  <div className="relative">
                    <Gamepad2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.bgmiPlayerId}
                      onChange={e => setForm(f => ({ ...f, bgmiPlayerId: e.target.value }))}
                      placeholder="Your BGMI Player ID"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
                    />
                  </div>
                </div>
                {error && <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                <button
                  type="submit"
                  disabled={otpLoading || !actor}
                  className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-base hover:opacity-90 transition-all shadow-brand disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {otpLoading ? <><Loader2 size={18} className="animate-spin" /> Sending OTP...</> : <>Continue <ArrowRight size={18} /></>}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtp} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-muted-foreground text-sm">OTP sent to <strong>+91 {form.mobile}</strong></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter OTP"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors text-center text-xl tracking-widest font-bold"
                  />
                  {generatedOtp && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Demo OTP: <span className="text-brand-red font-bold">{generatedOtp}</span>
                    </p>
                  )}
                </div>
                {error && <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                <button
                  type="submit"
                  disabled={verifyLoading || registerPlayer.isPending}
                  className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-base hover:opacity-90 transition-all shadow-brand disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(verifyLoading || registerPlayer.isPending) ? <><Loader2 size={18} className="animate-spin" /> Registering...</> : <>Complete Registration <ArrowRight size={18} /></>}
                </button>
                <button type="button" onClick={() => { setStep('details'); setOtp(''); setError(''); }} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to details
                </button>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-full bg-brand-gradient flex items-center justify-center mx-auto mb-4 shadow-brand">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Welcome, {form.displayName}!</h3>
                <p className="text-muted-foreground mb-6">Your account has been created successfully.</p>
                <button
                  onClick={() => navigate({ to: '/player/dashboard' })}
                  className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-base hover:opacity-90 transition-all shadow-brand"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {step !== 'success' && (
              <div className="mt-6 pt-4 border-t border-border text-center">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{' '}
                  <button onClick={() => navigate({ to: '/player/login' })} className="text-brand-red font-semibold hover:underline">
                    Login here
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
