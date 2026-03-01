import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useActor } from '../hooks/useActor';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

type Step = 'mobile' | 'otp' | 'profile';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();

  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bgmiPlayerId, setBgmiPlayerId] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (!actor) throw new Error('Not connected');
      const otpVal = await actor.generateOtp();
      setGeneratedOtp(otpVal);
      setStep('otp');
      // In production OTP would be sent via SMS; here we show it for demo
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (!actor) throw new Error('Not connected');
      const valid = await actor.verifyOtp(otp);
      if (!valid) {
        setError('Invalid OTP. Please try again.');
        setLoading(false);
        return;
      }
      setStep('profile');
    } catch (e: any) {
      setError(e.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!displayName.trim()) { setError('Please enter your display name'); return; }
    if (!bgmiPlayerId.trim()) { setError('Please enter your BGMI Player ID'); return; }
    if (!termsAccepted) { setError('Please accept the Terms & Conditions'); return; }
    setError('');
    setLoading(true);
    try {
      if (!actor) throw new Error('Not connected');
      await actor.registerPlayer(mobile, bgmiPlayerId, displayName);
      login({ mobile, displayName, bgmiPlayerId });
      navigate({ to: '/player/dashboard' });
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        setError('This account already exists. Please login instead.');
      } else {
        setError(e.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate({ to: '/' })}>
            <img src="/assets/generated/raj-empire-esports-logo.dim_400x120.png" alt="Raj Empire Esports" className="h-12 object-contain" />
          </button>
          <button onClick={() => navigate({ to: '/player/login' })} className="font-rajdhani font-semibold text-muted-foreground hover:text-primary transition-colors tracking-widest text-sm uppercase">
            Login
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border p-8">
            <div className="mb-8">
              <h1 className="font-orbitron font-bold text-2xl text-primary uppercase tracking-widest mb-2">
                {step === 'mobile' ? 'Register' : step === 'otp' ? 'Verify OTP' : 'Complete Profile'}
              </h1>
              <p className="font-saira text-muted-foreground text-sm">
                {step === 'mobile' ? 'Enter your mobile number to get started' :
                  step === 'otp' ? `OTP sent to +91 ${mobile}` :
                    'Fill in your gaming profile details'}
              </p>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-8">
              {(['mobile', 'otp', 'profile'] as Step[]).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-rajdhani font-bold border-2 transition-colors ${
                    step === s ? 'border-primary bg-primary text-primary-foreground' :
                      (['mobile', 'otp', 'profile'].indexOf(step) > i) ? 'border-primary bg-primary/20 text-primary' :
                        'border-border text-muted-foreground'
                  }`}>
                    {(['mobile', 'otp', 'profile'].indexOf(step) > i) ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 ${(['mobile', 'otp', 'profile'].indexOf(step) > i) ? 'bg-primary' : 'bg-border'}`} />}
                </React.Fragment>
              ))}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive font-saira text-sm px-4 py-3 mb-6">
                {error}
              </div>
            )}

            {step === 'mobile' && (
              <div className="space-y-4">
                <div>
                  <label className="font-rajdhani font-semibold text-foreground text-sm uppercase tracking-wider block mb-2">Mobile Number</label>
                  <div className="flex">
                    <span className="bg-muted border border-border border-r-0 px-3 flex items-center font-saira text-muted-foreground text-sm">+91</span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="flex-1 bg-background border border-border px-4 py-3 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading || !actor}
                  className="w-full bg-primary text-primary-foreground font-rajdhani font-bold py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send OTP
                </button>
                <p className="text-center font-saira text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button onClick={() => navigate({ to: '/player/login' })} className="text-primary hover:underline">Login</button>
                </p>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
                <div>
                  <label className="font-rajdhani font-semibold text-foreground text-sm uppercase tracking-wider block mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter OTP"
                    className="w-full bg-background border border-border px-4 py-3 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-center text-2xl tracking-widest"
                  />
                  {generatedOtp && (
                    <p className="text-xs font-saira text-muted-foreground mt-2 text-center">
                      Demo OTP: <span className="text-primary font-bold">{generatedOtp}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-rajdhani font-bold py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify OTP
                </button>
                <button onClick={() => { setStep('mobile'); setOtp(''); setError(''); }} className="w-full flex items-center justify-center gap-2 font-rajdhani text-muted-foreground hover:text-foreground transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" /> Change Mobile Number
                </button>
              </div>
            )}

            {step === 'profile' && (
              <div className="space-y-4">
                <div>
                  <label className="font-rajdhani font-semibold text-foreground text-sm uppercase tracking-wider block mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your in-game name"
                    className="w-full bg-background border border-border px-4 py-3 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="font-rajdhani font-semibold text-foreground text-sm uppercase tracking-wider block mb-2">BGMI Player ID</label>
                  <input
                    type="text"
                    value={bgmiPlayerId}
                    onChange={e => setBgmiPlayerId(e.target.value)}
                    placeholder="Your BGMI Player ID"
                    className="w-full bg-background border border-border px-4 py-3 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-1 accent-primary"
                  />
                  <label htmlFor="terms" className="font-saira text-sm text-muted-foreground cursor-pointer">
                    I agree to the{' '}
                    <button onClick={() => navigate({ to: '/terms' })} className="text-primary hover:underline">Terms & Conditions</button>
                  </label>
                </div>
                <button
                  onClick={handleRegister}
                  disabled={loading || !termsAccepted}
                  className="w-full bg-primary text-primary-foreground font-rajdhani font-bold py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Complete Registration
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
