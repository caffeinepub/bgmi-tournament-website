import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Gamepad2, ShieldCheck } from 'lucide-react';
import AuthMethodButtons from '../components/AuthMethodButtons';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();
  const { login: iiLogin, clear: iiClear, identity, isLoggingIn } = useInternetIdentity();

  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // When identity becomes available, fetch profile and log in
  useEffect(() => {
    if (identity && !isVerifying) {
      handleFetchProfileAndLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity]);

  const handleFetchProfileAndLogin = async () => {
    if (!actor) return;
    setIsVerifying(true);
    setError('');
    try {
      const profile = await actor.getCallerUserProfile();
      if (profile) {
        login({
          mobile: profile.mobile,
          displayName: profile.displayName,
          bgmiPlayerId: profile.bgmiPlayerId,
        });
        navigate({ to: '/player' });
      } else {
        setError('No account found for this identity. Please register first.');
        await iiClear();
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
      await iiClear();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMethodClick = async () => {
    setError('');
    try {
      await iiLogin();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    }
  };

  const isLoading = isLoggingIn || isVerifying;

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
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30 mb-3">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-orbitron font-bold text-white text-base mb-1">Secure Login</h3>
            <p className="text-gray-400 text-sm">
              Choose a method to securely access your account.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <AuthMethodButtons
            onMethodClick={handleMethodClick}
            isLoading={isLoading}
            loadingText={isVerifying ? 'Verifying...' : 'Authenticating...'}
          />

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
