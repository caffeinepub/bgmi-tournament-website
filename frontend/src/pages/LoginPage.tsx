import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useActor } from '../hooks/useActor';
import { useGenerateOtp, useVerifyOtp } from '../hooks/useQueries';
import { Gamepad2, Phone, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();
  const generateOtp = useGenerateOtp();
  const verifyOtp = useVerifyOtp();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!mobile.trim() || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      const otpVal = await generateOtp.mutateAsync();
      setGeneratedOtp(otpVal);
      setStep('otp');
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    try {
      const isValid = await verifyOtp.mutateAsync(otp);
      if (!isValid) {
        setError('Invalid OTP. Please try again.');
        return;
      }
      // Fetch profile
      if (actor) {
        const profile = await actor.getCallerUserProfile();
        if (profile) {
          login({ mobile, displayName: profile.displayName, bgmiPlayerId: profile.bgmiPlayerId });
          navigate({ to: '/player' });
        } else {
          setError('No account found. Please register first.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-red to-brand-orange shadow-lg shadow-brand-red/30 mb-4">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-orbitron font-bold text-white text-2xl">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Login to Raj Empire Esports Arena</p>
        </div>

        <div className="bg-brand-dark border border-brand-red/20 rounded-2xl p-6 shadow-xl">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step === 'mobile' ? 'bg-brand-red text-white' : 'bg-brand-red/20 text-brand-orange'}`}>1</div>
            <div className="flex-1 h-0.5 bg-brand-red/20">
              <div className={`h-full bg-brand-red transition-all ${step === 'otp' ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step === 'otp' ? 'bg-brand-red text-white' : 'bg-white/10 text-gray-500'}`}>2</div>
          </div>

          {step === 'mobile' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter your 10-digit mobile number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 focus:bg-white/8 transition-all text-sm"
                    maxLength={10}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={generateOtp.isPending}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-brand-red/20"
              >
                {generateOtp.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Send OTP</>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Enter OTP</label>
                <p className="text-xs text-gray-500 mb-3">OTP sent to +91 {mobile}</p>
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
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={verifyOtp.isPending}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-brand-red/20"
              >
                {verifyOtp.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Verify & Login</>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('mobile'); setError(''); setOtp(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
              >
                ← Change mobile number
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                onClick={() => navigate({ to: '/player/register' })}
                className="text-brand-orange hover:text-brand-red transition-colors font-medium"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
