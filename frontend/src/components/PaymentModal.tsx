import React, { useState, useRef } from 'react';
import { Tournament } from '../backend';
import { ExternalBlob } from '../backend';
import { useRegisterForTournament } from '../hooks/useQueries';
import { X, Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export default function PaymentModal({ tournament, onClose }: PaymentModalProps) {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const registerMutation = useRegisterForTournament();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!screenshot) { setError('Please upload your payment screenshot'); return; }
    if (!termsAccepted) { setError('Please accept the terms and conditions'); return; }

    try {
      const arrayBuffer = await screenshot.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => setUploadProgress(pct));
      await registerMutation.mutateAsync({ tournamentId: tournament.id, paymentScreenshotBlob: blob });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    }
  };

  const qrUrl = tournament.qrCodeBlob ? tournament.qrCodeBlob.getDirectURL() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-brand-dark border border-brand-red/30 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="font-orbitron font-bold text-white text-base">Register for Tournament</h2>
            <p className="text-gray-400 text-xs mt-0.5">{tournament.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-orbitron font-bold text-white text-lg mb-2">Registration Submitted!</h3>
            <p className="text-gray-400 text-sm mb-5">
              Your registration is pending admin approval. You'll be notified once approved.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Tournament Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500">Entry Fee</p>
                <p className="text-brand-orange font-bold">₹{tournament.entryFee.toString()}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500">Prize Pool</p>
                <p className="text-green-400 font-bold">₹{tournament.prizePool.toString()}</p>
              </div>
            </div>

            {/* UPI Details */}
            <div className="bg-brand-red/10 border border-brand-red/30 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3">Payment Details</h3>
              <div className="flex gap-4 items-start">
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Code" className="w-24 h-24 rounded-lg object-cover border border-white/10" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-gray-500 text-xs text-center">No QR</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">UPI ID</p>
                  <p className="text-white font-mono text-sm bg-white/5 rounded-lg px-3 py-2 break-all">
                    {tournament.upiId || 'Not set'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Pay ₹{tournament.entryFee.toString()} and upload screenshot below
                  </p>
                </div>
              </div>
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Payment Screenshot</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-brand-red/50 transition-all"
              >
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Screenshot" className="max-h-32 mx-auto rounded-lg object-contain" />
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Click to upload payment screenshot</p>
                    <p className="text-gray-600 text-xs mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {registerMutation.isPending && uploadProgress > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-red to-brand-orange transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-brand-red"
              />
              <span className="text-sm text-gray-400">
                I accept the{' '}
                <a href="/terms" target="_blank" className="text-brand-orange hover:underline">
                  Terms & Conditions
                </a>{' '}
                and confirm that the payment has been made.
              </span>
            </label>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-brand-red/20"
            >
              {registerMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Submit Registration</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
