import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useRegisterPlayer, useSaveCallerUserProfile } from '../hooks/useQueries';
import {
  Gamepad2, Phone, User, Hash, ArrowRight, Loader2,
  CheckCircle, ShieldCheck, AlertCircle, PartyPopper, LayoutDashboard
} from 'lucide-react';
import AuthMethodButtons from '../components/AuthMethodButtons';

interface FieldErrors {
  displayName?: string;
  mobile?: string;
  bgmiPlayerId?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { login: iiLogin, clear: iiClear, identity, isLoggingIn, isLoginError } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const registerPlayer = useRegisterPlayer();
  const saveProfile = useSaveCallerUserProfile();

  const [step, setStep] = useState<'details' | 'authenticate' | 'success'>('details');
  const [form, setForm] = useState({ displayName: '', mobile: '', bgmiPlayerId: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Track if we've already triggered registration to avoid double-calls
  const registrationTriggeredRef = useRef(false);
  // Track if the user has explicitly clicked an auth method button on step 2
  const loginInitiatedRef = useRef(false);

  // Watch isLoginError: if login fails/is cancelled, reset so user can retry
  useEffect(() => {
    if (step === 'authenticate' && isLoginError) {
      loginInitiatedRef.current = false;
      setGlobalError('Authentication cancelled or failed. Please try again.');
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
      !registrationTriggeredRef.current &&
      loginInitiatedRef.current
    ) {
      registrationTriggeredRef.current = true;
      handleCompleteRegistration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, step, actor, actorFetching]);

  // ── Validation helpers ──────────────────────────────────────────────────────

  const validateDisplayName = (value: string): string => {
    if (!value.trim()) return 'Display name is required';
    if (value.trim().length < 2) return 'Display name must be at least 2 characters';
    return '';
  };

  const validateMobile = (value: string): string => {
    if (!value.trim()) return 'Mobile number is required';
    if (!/^[0-9]+$/.test(value)) return 'Mobile number must contain digits only';
    if (value.length !== 10) return 'Mobile number must be exactly 10 digits';
    return '';
  };

  const validateBgmiPlayerId = (value: string): string => {
    if (!value.trim()) return 'BGMI Player ID is required';
    if (!/^[a-zA-Z0-9]+$/.test(value.trim())) return 'BGMI Player ID must be alphanumeric (letters and numbers only)';
    return '';
  };

  // ── Field change handlers ───────────────────────────────────────────────────

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, displayName: value }));
    if (fieldErrors.displayName) {
      setFieldErrors(prev => ({ ...prev, displayName: validateDisplayName(value) || undefined }));
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setForm(prev => ({ ...prev, mobile: value }));
    if (fieldErrors.mobile) {
      setFieldErrors(prev => ({ ...prev, mobile: validateMobile(value) || undefined }));
    }
  };

  const handleBgmiPlayerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, bgmiPlayerId: value }));
    if (fieldErrors.bgmiPlayerId) {
      setFieldErrors(prev => ({ ...prev, bgmiPlayerId: validateBgmiPlayerId(value) || undefined }));
    }
  };

  // ── Form submit ─────────────────────────────────────────────────────────────

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    const errors: FieldErrors = {};
    const dnErr = validateDisplayName(form.displayName);
    const mobErr = validateMobile(form.mobile);
    const bgmiErr = validateBgmiPlayerId(form.bgmiPlayerId);

    if (dnErr) errors.displayName = dnErr;
    if (mobErr) errors.mobile = mobErr;
    if (bgmiErr) errors.bgmiPlayerId = bgmiErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    // Reset refs when entering authenticate step
    registrationTriggeredRef.current = false;
    loginInitiatedRef.current = false;
    setStep('authenticate');
  };

  // Called when user clicks any auth method button on Step 2
  const handleAuthMethodClick = () => {
    setGlobalError('');
    loginInitiatedRef.current = true;
    iiLogin();
  };

  const handleCompleteRegistration = async () => {
    setIsRegistering(true);
    setGlobalError('');
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
        setGlobalError(msg || 'Registration failed. Please try again.');
        registrationTriggeredRef.current = false;
        loginInitiatedRef.current = false;
        await iiClear();
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const steps = ['Details', 'Authenticate', 'Done'];
  const currentStepIdx = step === 'details' ? 0 : step === 'authenticate' ? 1 : 2;

  const isActorReady = !!actor && !actorFetching;
  const isWaitingForActor = identity && !isActorReady && step === 'authenticate';
  // Show connecting state only after user has clicked the button
  const isConnecting = loginInitiatedRef.current && isLoggingIn && !identity;

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

          {/* ── Step 1: Details ── */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4" noValidate>
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Display Name <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={handleDisplayNameChange}
                    onBlur={() => {
                      const err = validateDisplayName(form.displayName);
                      setFieldErrors(prev => ({ ...prev, displayName: err || undefined }));
                    }}
                    placeholder="Your in-game name"
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm ${
                      fieldErrors.displayName
                        ? 'border-red-500/60 focus:border-red-500'
                        : 'border-white/10 focus:border-brand-red/60'
                    }`}
                  />
                </div>
                {fieldErrors.displayName && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-xs">{fieldErrors.displayName}</p>
                  </div>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Mobile Number <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={form.mobile}
                    onChange={handleMobileChange}
                    onBlur={() => {
                      const err = validateMobile(form.mobile);
                      setFieldErrors(prev => ({ ...prev, mobile: err || undefined }));
                    }}
                    placeholder="10-digit mobile number"
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm ${
                      fieldErrors.mobile
                        ? 'border-red-500/60 focus:border-red-500'
                        : 'border-white/10 focus:border-brand-red/60'
                    }`}
                    maxLength={10}
                  />
                </div>
                {fieldErrors.mobile && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-xs">{fieldErrors.mobile}</p>
                  </div>
                )}
                <p className="text-gray-600 text-xs mt-1">Digits only, no spaces or dashes</p>
              </div>

              {/* BGMI Player ID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  BGMI Player ID <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={form.bgmiPlayerId}
                    onChange={handleBgmiPlayerIdChange}
                    onBlur={() => {
                      const err = validateBgmiPlayerId(form.bgmiPlayerId);
                      setFieldErrors(prev => ({ ...prev, bgmiPlayerId: err || undefined }));
                    }}
                    placeholder="Your BGMI Player ID (e.g. 5123456789)"
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm ${
                      fieldErrors.bgmiPlayerId
                        ? 'border-red-500/60 focus:border-red-500'
                        : 'border-white/10 focus:border-brand-red/60'
                    }`}
                  />
                </div>
                {fieldErrors.bgmiPlayerId && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-xs">{fieldErrors.bgmiPlayerId}</p>
                  </div>
                )}
                <p className="text-gray-600 text-xs mt-1">Letters and numbers only</p>
              </div>

              {globalError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {globalError}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-red/20 mt-2"
              >
                <ArrowRight className="w-4 h-4" /> Continue
              </button>

              <p className="text-center text-gray-500 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate({ to: '/player/login' })}
                  className="text-brand-orange hover:underline font-medium"
                >
                  Login here
                </button>
              </p>
            </form>
          )}

          {/* ── Step 2: Authentication ── */}
          {step === 'authenticate' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30 mb-3">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-orbitron font-bold text-white text-base mb-1">Verify Your Identity</h3>
                <p className="text-gray-400 text-sm">
                  Choose a method to securely create your account on the blockchain.
                </p>
              </div>

              {/* Account details summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Account Details</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Display Name</span>
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

              {globalError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {globalError}
                </div>
              )}

              {/* Auth method buttons or loading state */}
              {(isRegistering || isWaitingForActor) ? (
                <AuthMethodButtons
                  onMethodClick={handleAuthMethodClick}
                  isLoading={true}
                  loadingText={isWaitingForActor ? 'Connecting...' : 'Creating Account...'}
                />
              ) : isConnecting ? (
                <AuthMethodButtons
                  onMethodClick={handleAuthMethodClick}
                  isLoading={true}
                  loadingText="Opening Identity Provider..."
                />
              ) : (
                <AuthMethodButtons
                  onMethodClick={handleAuthMethodClick}
                  isLoading={false}
                />
              )}

              <button
                type="button"
                onClick={() => {
                  setStep('details');
                  setGlobalError('');
                  registrationTriggeredRef.current = false;
                  loginInitiatedRef.current = false;
                }}
                className="w-full text-center text-gray-500 text-sm hover:text-gray-300 transition-colors"
              >
                ← Back to Details
              </button>

              <p className="text-center text-gray-500 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate({ to: '/player/login' })}
                  className="text-brand-orange hover:underline font-medium"
                >
                  Login here
                </button>
              </p>
            </div>
          )}

          {/* ── Step 3: Success ── */}
          {step === 'success' && (
            <div className="space-y-5 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 mb-2">
                <PartyPopper className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white text-lg mb-1">Account Created! 🎉</h3>
                <p className="text-gray-400 text-sm">Welcome to Raj Empire Esports Arena, {form.displayName}!</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-left">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Your Account</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Display Name</span>
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

              <button
                type="button"
                onClick={() => navigate({ to: '/player' })}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-red/20"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
