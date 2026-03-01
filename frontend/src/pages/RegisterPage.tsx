import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useActor } from '../hooks/useActor';
import { useGenerateOtp, useVerifyOtp, useRegisterPlayer, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Gamepad2, Phone, KeyRound, User, Hash, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();
  const generateOtp = useGenerateOtp();
  const verifyOtp = useVerifyOtp();
  const registerPlayer = useRegisterPlayer();
  const saveProfile = useSaveCallerUserProfile();

  const [step, setStep] = useState<'details' | 'otp' | 'success'>('details');
  const [form, setForm] = useState({ displayName: '', mobile: '', bgmiPlayerId: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.displayName.trim()) { setError('Please enter your display name'); return; }
    if (!form.mobile.trim() || form.mobile.length < 10) { setError('Please enter a valid 10-digit mobile number'); return; }
    if (!form.bgmiPlayerId.trim()) { setError('Please enter your BGMI Player ID'); return; }
    try {
      const otpVal = await generateOtp.mutateAsync();
      setGeneratedOtp(otpVal);
      setStep('otp');
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) { setError('Please enter the OTP'); return; }
    try {
      const isValid = await verifyOtp.mutateAsync(otp);
      if (!isValid) { setError('Invalid OTP. Please try again.'); return; }

      // Register player
      await registerPlayer.mutateAsync({
        mobile: form.mobile,
        bgmiPlayerId: form.bgmiPlayerId,
        displayName: form.displayName,
      });

      // Save profile
      await saveProfile.mutateAsync({
        displayName: form.displayName,
        mobile: form.mobile,
        bgmiPlayerId: form.bgmiPlayerId,
      });

      login({ mobile: form.mobile, displayName: form.displayName, bgmiPlayerId: form.bgmiPlayerId });
      setStep('success');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Player already exists')) {
        // Already registered, just login
        login({ mobile: form.mobile, displayName: form.displayName, bgmiPlayerId: form.bgmiPlayerId });
        setStep('success');
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    }
  };

  const steps = ['Details', 'Verify OTP', 'Done'];
  const currentStepIdx = step === 'details' ? 0 : step === 'otp' ? 1 : 2;

  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-red to-brand-orange shadow-lg shadow-brand-red/30 mb-4">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-orbitron font-bold text-white text-2xl">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join Raj Empire Esports Arena</p>
        </div>

        <div className="bg-brand-dark border border-brand-red/20 rounded-2xl p-6 shadow-xl">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < currentStepIdx ? 'bg-green-500 text-white' : i === currentStepIdx ? 'bg-brand-red text-white' : 'bg-white/10 text-gray-500'}`}>
                    {i < currentStepIdx ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs ${i === currentStepIdx ? 'text-brand-orange' : 'text-gray-600'}`}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 bg-white/10">
                    <div className={`h-full bg-brand-red transition-all ${i < currentStepIdx ? 'w-full' : 'w-0'}`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="Your in-game name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm"
                    maxLength={10}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">BGMI Player ID</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={form.bgmiPlayerId}
                    onChange={(e) => setForm({ ...form, bgmiPlayerId: e.target.value })}
                    placeholder="Your BGMI Player ID"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={generateOtp.isPending}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-brand-red/20"
              >
                {generateOtp.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Continue</>
                )}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Enter OTP</label>
                <p className="text-xs text-gray-500 mb-3">OTP sent to +91 {form.mobile}</p>
                {generatedOtp && (
                  <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-lg px-3 py-2 text-brand-orange text-sm mb-3">
                    Demo OTP: <strong>{generatedOtp}</strong>
                  </div>
                )}
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm tracking-widest"
                    maxLength={4}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={verifyOtp.isPending || registerPlayer.isPending || saveProfile.isPending}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-brand-red/20"
              >
                {(verifyOtp.isPending || registerPlayer.isPending || saveProfile.isPending) ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Complete Registration</>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('details'); setError(''); setOtp(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
              >
                ← Go back
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-orbitron font-bold text-white text-lg mb-2">Welcome, {form.displayName}!</h3>
              <p className="text-gray-400 text-sm mb-6">Your account has been created successfully.</p>
              <button
                onClick={() => navigate({ to: '/player' })}
                className="w-full bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-red/20"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {step !== 'success' && (
            <div className="mt-5 pt-4 border-t border-white/5 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  onClick={() => navigate({ to: '/player/login' })}
                  className="text-brand-orange hover:text-brand-red transition-colors font-medium"
                >
                  Login here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
