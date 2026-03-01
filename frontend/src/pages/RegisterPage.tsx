import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useRegisterPlayer, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Gamepad2, Phone, User, Hash, ArrowRight, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { login: iiLogin, clear: iiClear, identity, isLoggingIn, isLoginError } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const registerPlayer = useRegisterPlayer();
  const saveProfile = useSaveCallerUserProfile();

  const [step, setStep] = useState<'details' | 'authenticate' | 'success'>('details');
  const [form, setForm] = useState({ displayName: '', mobile: '', bgmiPlayerId: '' });
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Track whether the auto-trigger login has been attempted for this authenticate session
  const autoLoginAttemptedRef = useRef(false);
  // Track if we've already triggered registration to avoid double-calls
  const registrationTriggeredRef = useRef(false);

  // Auto-trigger Internet Identity login when step becomes 'authenticate'
  useEffect(() => {
    if (step === 'authenticate' && !autoLoginAttemptedRef.current && !identity) {
      autoLoginAttemptedRef.current = true;
      setError('');
      // login() returns void — call it directly, watch isLoginError via separate effect
      iiLogin();
    }
  }, [step, identity, iiLogin]);

  // Watch isLoginError: if login fails/is cancelled, reset so user can retry
  useEffect(() => {
    if (step === 'authenticate' && isLoginError) {
      autoLoginAttemptedRef.current = false;
      setError('Authentication failed or was cancelled. Please try again.');
    }
  }, [isLoginError, step]);

  // When identity becomes available AND actor is ready in the 'authenticate' step, complete registration
  useEffect(() => {
    if (
      step === 'authenticate' &&
      identity &&
      actor &&
      !actorFetching &&
      !isRegistering &&
      !registrationTriggeredRef.current
    ) {
      registrationTriggeredRef.current = true;
      handleCompleteRegistration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, step, actor, actorFetching]);

  // Redirect to Home Page after successful registration
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        navigate({ to: '/' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.displayName.trim()) { setError('Please enter your display name'); return; }
    if (!form.mobile.trim() || form.mobile.length < 10) { setError('Please enter a valid 10-digit mobile number'); return; }
    if (!form.bgmiPlayerId.trim()) { setError('Please enter your BGMI Player ID'); return; }
    // Reset refs when entering authenticate step
    registrationTriggeredRef.current = false;
    autoLoginAttemptedRef.current = false;
    setStep('authenticate');
  };

  const handleInternetIdentityLogin = () => {
    setError('');
    autoLoginAttemptedRef.current = true;
    iiLogin();
  };

  const handleCompleteRegistration = async () => {
    setIsRegistering(true);
    setError('');
    try {
      await registerPlayer.mutateAsync({
        mobile: form.mobile,
        bgmiPlayerId: form.bgmiPlayerId,
        displayName: form.displayName,
      });

      await saveProfile.mutateAsync({
        displayName: form.displayName,
        mobile: form.mobile,
        bgmiPlayerId: form.bgmiPlayerId,
      });

      login({ mobile: form.mobile, displayName: form.displayName, bgmiPlayerId: form.bgmiPlayerId });
      setStep('success');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Player already exists') || msg.includes('already registered')) {
        login({ mobile: form.mobile, displayName: form.displayName, bgmiPlayerId: form.bgmiPlayerId });
        setStep('success');
      } else {
        setError(msg || 'Registration failed. Please try again.');
        registrationTriggeredRef.current = false;
        autoLoginAttemptedRef.current = false;
        // Clear II identity so user can retry
        await iiClear();
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const steps = ['Details', 'Authenticate', 'Done'];
  const currentStepIdx = step === 'details' ? 0 : step === 'authenticate' ? 1 : 2;

  // Determine the state of the authenticate step
  const isActorReady = !!actor && !actorFetching;
  const isWaitingForActor = identity && !isActorReady && step === 'authenticate';
  // Show connecting state when: logging in OR auto-login attempted and not yet failed/succeeded
  const isConnecting = isLoggingIn || (autoLoginAttemptedRef.current && !identity && !isLoginError);

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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < currentStepIdx
                      ? 'bg-green-500 text-white'
                      : i === currentStepIdx
                      ? 'bg-brand-red text-white'
                      : 'bg-white/10 text-gray-500'
                  }`}>
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

          {/* Step 1: Details */}
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
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-red/20"
              >
                <ArrowRight className="w-4 h-4" /> Continue
              </button>
            </form>
          )}

          {/* Step 2: Internet Identity Authentication */}
          {step === 'authenticate' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30 mb-3">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-orbitron font-bold text-white text-base mb-1">Verify Your Identity</h3>
                <p className="text-gray-400 text-sm">
                  Authenticate with Internet Identity to securely create your account on the blockchain.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Account Details</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="text-white font-medium">{form.displayName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mobile</span>
                  <span className="text-white font-medium">{form.mobile}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">BGMI ID</span>
                  <span className="text-white font-medium">{form.bgmiPlayerId}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">{error}</div>
              )}

              {/* Show loading state while registering or waiting for actor */}
              {(isRegistering || isWaitingForActor) ? (
                <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl opacity-80 cursor-not-allowed">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isWaitingForActor ? 'Connecting...' : 'Creating Account...'}
                </div>
              ) : isConnecting ? (
                /* Auto-triggering or manually logging in */
                <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 rounded-xl opacity-80 cursor-not-allowed">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opening Internet Identity...
                </div>
              ) : (
                /* Retry button — shown after failure/cancellation */
                <button
                  type="button"
                  onClick={handleInternetIdentityLogin}
                  disabled={isLoggingIn || isRegistering}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-blue-600/20"
                >
                  <ShieldCheck className="w-4 h-4" /> Login with Internet Identity
                </button>
              )}

              {!isRegistering && !isWaitingForActor && (
                <button
                  type="button"
                  onClick={() => {
                    setStep('details');
                    setError('');
                    registrationTriggeredRef.current = false;
                    autoLoginAttemptedRef.current = false;
                  }}
                  className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
                >
                  ← Go back
                </button>
              )}
            </div>
          )}

          {/* Step 3: Success — auto-redirects to Home Page */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-orbitron font-bold text-white text-lg mb-2">Welcome, {form.displayName}!</h3>
              <p className="text-gray-400 text-sm mb-2">Your account has been created successfully.</p>
              <p className="text-gray-500 text-xs mb-6 flex items-center justify-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Redirecting to Home...
              </p>
              <button
                onClick={() => navigate({ to: '/' })}
                className="w-full bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-red/20"
              >
                Go to Home
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
