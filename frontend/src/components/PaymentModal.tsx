import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, CheckCircle } from 'lucide-react';
import { Tournament } from '../backend';
import { ExternalBlob } from '../backend';
import { useRegisterForTournament } from '../hooks/useQueries';

interface PaymentModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export default function PaymentModal({ tournament, onClose }: PaymentModalProps) {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: registerForTournament, isPending, error } = useRegisterForTournament();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!screenshot) return;
    if (!termsAccepted) return;

    const arrayBuffer = await screenshot.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(pct => setUploadProgress(pct));

    registerForTournament(
      { tournamentId: tournament.id, paymentScreenshotBlob: blob },
      {
        onSuccess: () => setSuccess(true),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-orbitron font-bold text-primary uppercase tracking-widest text-lg">
            Register for Tournament
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="font-orbitron font-bold text-foreground text-xl mb-2">Registration Submitted!</h3>
            <p className="font-saira text-muted-foreground mb-6">
              Your registration is pending admin approval. Room details will be shared once approved.
            </p>
            <button onClick={onClose} className="bg-primary text-primary-foreground font-rajdhani font-bold px-8 py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Tournament Info */}
            <div className="bg-background border border-border p-4">
              <h3 className="font-rajdhani font-bold text-foreground text-lg mb-3">{tournament.name}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-saira text-muted-foreground text-xs">Entry Fee</p>
                  <p className="font-rajdhani font-bold text-primary">₹{tournament.entryFee.toString()}</p>
                </div>
                <div>
                  <p className="font-saira text-muted-foreground text-xs">Prize Pool</p>
                  <p className="font-rajdhani font-bold text-primary">₹{tournament.prizePool.toString()}</p>
                </div>
                <div>
                  <p className="font-saira text-muted-foreground text-xs">Map</p>
                  <p className="font-rajdhani font-bold text-foreground">{tournament.map}</p>
                </div>
                <div>
                  <p className="font-saira text-muted-foreground text-xs">Slots Left</p>
                  <p className="font-rajdhani font-bold text-foreground">
                    {(Number(tournament.totalSlots) - Number(tournament.filledSlots))} remaining
                  </p>
                </div>
              </div>
            </div>

            {/* UPI Payment */}
            <div>
              <h4 className="font-rajdhani font-bold text-foreground uppercase tracking-wider text-sm mb-3">Payment Details</h4>
              <div className="bg-background border border-border p-4 text-center">
                <img
                  src="/assets/generated/upi-qr-placeholder.dim_300x300.png"
                  alt="UPI QR Code"
                  className="w-40 h-40 object-contain mx-auto mb-3"
                />
                <p className="font-saira text-sm text-muted-foreground">UPI ID:</p>
                <p className="font-rajdhani font-bold text-primary text-lg">{tournament.upiId || 'rajempire@upi'}</p>
                <p className="font-saira text-xs text-muted-foreground mt-2">
                  Pay ₹{tournament.entryFee.toString()} and upload screenshot below
                </p>
              </div>
            </div>

            {/* Screenshot Upload */}
            <div>
              <h4 className="font-rajdhani font-bold text-foreground uppercase tracking-wider text-sm mb-3">Upload Payment Screenshot</h4>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                  screenshot ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'
                }`}
              >
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Payment screenshot" className="max-h-40 mx-auto object-contain" />
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="font-saira text-sm text-muted-foreground">Click to upload payment screenshot</p>
                    <p className="font-saira text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Upload progress */}
            {isPending && uploadProgress > 0 && uploadProgress < 100 && (
              <div>
                <div className="flex justify-between text-xs font-saira text-muted-foreground mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="modal-terms"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <label htmlFor="modal-terms" className="font-saira text-sm text-muted-foreground cursor-pointer">
                I confirm the payment has been made and agree to the tournament rules.
              </label>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive font-saira text-sm px-4 py-3">
                {(error as Error).message || 'Registration failed. Please try again.'}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!screenshot || !termsAccepted || isPending}
              className="w-full bg-primary text-primary-foreground font-rajdhani font-bold py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
