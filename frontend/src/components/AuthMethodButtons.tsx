import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthMethodButtonsProps {
  onMethodClick: () => void;
  isLoading?: boolean;
  loadingText?: string;
}

// Google multicolor G icon
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
    <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
    <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.316 0-9.828-3.417-11.534-8.162l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
    <path d="M43.611 20.083H42V20H24v8h11.303a11.966 11.966 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
  </svg>
);

// Apple logo icon
const AppleIcon = () => (
  <svg width="20" height="22" viewBox="0 0 814 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.7 0 248.7 0 126.8c0-70.3 24.2-143.3 68.2-200.8 42.8-56.1 107-92.1 178.3-92.1 70.3 0 125.6 44.4 170.7 44.4 43.3 0 109.3-46.8 188.3-46.8zm-90.5-181.1c33.7-40.2 57.8-96.2 57.8-152.2 0-7.7-.6-15.5-1.9-22.6-55.1 2-120.5 36.7-159.6 82.2-31.1 35.5-59.5 91.5-59.5 148.4 0 8.3 1.3 16.6 1.9 19.2 3.2.6 8.4 1.3 13.6 1.3 49.1 0 108.8-32.8 147.7-76.3z"/>
  </svg>
);

// Microsoft colored squares icon
const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

// Passkey person icon
const PasskeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="7" r="4" fill="currentColor"/>
    <path d="M2 21v-2a7 7 0 0 1 10.5-6.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="17" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M19.5 18.5L22 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function AuthMethodButtons({ onMethodClick, isLoading = false, loadingText = 'Authenticating...' }: AuthMethodButtonsProps) {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold py-3.5 rounded-xl opacity-80 cursor-not-allowed">
        <Loader2 className="w-4 h-4 animate-spin" />
        {loadingText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Label */}
      <p className="text-center text-xs text-gray-400 font-medium uppercase tracking-wider">Choose method</p>

      {/* Google, Apple, Microsoft row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Google */}
        <button
          type="button"
          onClick={onMethodClick}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          aria-label="Continue with Google"
        >
          <GoogleIcon />
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={onMethodClick}
          className="flex items-center justify-center gap-2 bg-black border border-gray-700 text-white font-semibold py-3 rounded-xl hover:bg-gray-900 active:scale-95 transition-all shadow-sm"
          aria-label="Continue with Apple"
        >
          <AppleIcon />
        </button>

        {/* Microsoft */}
        <button
          type="button"
          onClick={onMethodClick}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          aria-label="Continue with Microsoft"
        >
          <MicrosoftIcon />
        </button>
      </div>

      {/* Continue with Passkey - full width */}
      <button
        type="button"
        onClick={onMethodClick}
        className="w-full flex items-center justify-center gap-2.5 bg-white/5 border border-white/15 text-white font-semibold py-3.5 rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all"
        aria-label="Continue with Passkey"
      >
        <PasskeyIcon />
        <span>Continue with Passkey</span>
      </button>
    </div>
  );
}
