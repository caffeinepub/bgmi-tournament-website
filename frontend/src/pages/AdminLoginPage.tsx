import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Shield, Eye, EyeOff, Loader2, Lock, User, CheckCircle, AlertCircle, Fingerprint } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginWithCredentials, loginWithIdentity, isAdminAuthenticated, credentialsVerified, logout } = useAdminAuth();
  const { loginStatus, identity } = useInternetIdentity();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credError, setCredError] = useState('');
  const [identityError, setIdentityError] = useState('');
  const [iiLoading, setIiLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Redirect when fully authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate({ to: '/admin/dashboard' });
    }
  }, [isAdminAuthenticated, navigate]);

  // When identity becomes available after II login, show verifying state
  useEffect(() => {
    if (credentialsVerified && identity && !identity.getPrincipal().isAnonymous()) {
      setVerifying(true);
      // Give the context effect time to verify
      const timer = setTimeout(() => {
        setVerifying(false);
        if (!isAdminAuthenticated) {
          setIdentityError(
            'This Internet Identity is not authorized as admin. Please use the registered admin Internet Identity.'
          );
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [credentialsVerified, identity, isAdminAuthenticated]);

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');
    const success = loginWithCredentials(username, password);
    if (!success) {
      setCredError('Invalid username or password. Please try again.');
    }
  };

  const handleIdentityLogin = async () => {
    setIdentityError('');
    setIiLoading(true);
    try {
      const result = await loginWithIdentity();
      if (!result.success) {
        setIdentityError(result.error || 'Internet Identity login failed.');
      }
    } catch {
      setIdentityError('Internet Identity login failed. Please try again.');
    } finally {
      setIiLoading(false);
    }
  };

  const isIiLoading = iiLoading || loginStatus === 'logging-in' || verifying;

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

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            credentialsVerified
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-brand-red/20 text-brand-orange border border-brand-red/30'
          }`}>
            {credentialsVerified ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-brand-orange flex items-center justify-center text-[10px] font-bold text-white">1</span>
            )}
            Credentials
          </div>
          <div className="w-6 h-px bg-white/20" />
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            isAdminAuthenticated
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : credentialsVerified
              ? 'bg-brand-red/20 text-brand-orange border border-brand-red/30'
              : 'bg-white/5 text-gray-500 border border-white/10'
          }`}>
            {isAdminAuthenticated ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-current flex items-center justify-center text-[10px] font-bold text-white">2</span>
            )}
            Identity
          </div>
        </div>

        <div className="bg-brand-dark border border-brand-red/20 rounded-2xl p-6 shadow-xl">
          {/* STEP 1: Credentials */}
          {!credentialsVerified && (
            <div>
              <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-orange" />
                Step 1: Enter Admin Credentials
              </h2>
              <form onSubmit={handleCredentialSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Admin username"
                      autoComplete="username"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Admin password"
                      autoComplete="current-password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {credError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {credError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-red/20"
                >
                  <Shield className="w-4 h-4" />
                  Verify Credentials
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Internet Identity */}
          {credentialsVerified && (
            <div>
              <h2 className="text-white font-semibold text-base mb-2 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-brand-orange" />
                Step 2: Verify with Internet Identity
              </h2>
              <p className="text-gray-400 text-xs mb-5 leading-relaxed">
                Login with your Internet Identity to complete admin authentication. Only the registered admin identity will be granted access.
              </p>

              {/* Verifying state */}
              {verifying && (
                <div className="flex items-center gap-3 bg-brand-orange/10 border border-brand-orange/30 rounded-lg px-4 py-3 mb-4">
                  <Loader2 className="w-4 h-4 text-brand-orange animate-spin shrink-0" />
                  <span className="text-brand-orange text-sm">Verifying your identity...</span>
                </div>
              )}

              {identityError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{identityError}</span>
                </div>
              )}

              <button
                onClick={handleIdentityLogin}
                disabled={isIiLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-brand-red/20"
              >
                {isIiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {verifying ? 'Verifying...' : 'Connecting...'}
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    Login with Internet Identity
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  logout();
                  setIdentityError('');
                }}
                className="w-full mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors py-2"
              >
                ← Back to credentials
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
