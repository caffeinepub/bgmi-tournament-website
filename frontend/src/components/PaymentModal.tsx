import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Link } from '@tanstack/react-router';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ExternalBlob, Tournament } from '../backend';
import { useRegisterForTournament } from '../hooks/useQueries';

interface PaymentModalProps {
    tournament: Tournament;
    open: boolean;
    onClose: () => void;
}

export default function PaymentModal({ tournament, open, onClose }: PaymentModalProps) {
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const registerMutation = useRegisterForTournament();

    const upiId = tournament.upiId || 'empirerajesports@ibl';
    const qrUrl = tournament.qrCodeBlob ? tournament.qrCodeBlob.getDirectURL() : '/assets/generated/upi-qr-placeholder.dim_300x300.png';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setScreenshotFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!screenshotFile) {
            setError('Please upload a payment screenshot.');
            return;
        }
        if (!agreedToTerms) {
            setError('Please agree to the Terms & Conditions.');
            return;
        }
        setError('');
        try {
            const bytes = new Uint8Array(await screenshotFile.arrayBuffer());
            const blob = ExternalBlob.fromBytes(bytes);
            await registerMutation.mutateAsync({ tournamentId: tournament.id, paymentScreenshotBlob: blob });
            setSuccess(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            setError(msg);
        }
    };

    const handleClose = () => {
        setAgreedToTerms(false);
        setScreenshotFile(null);
        setScreenshotPreview(null);
        setSuccess(false);
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md border-0 p-0 overflow-hidden" style={{ background: 'oklch(0.12 0 0)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="font-orbitron text-lg" style={{ color: 'oklch(0.65 0.22 45)' }}>
                            Complete Payment
                        </DialogTitle>
                        <DialogDescription className="font-rajdhani" style={{ color: 'oklch(0.60 0.02 60)' }}>
                            {tournament.name}
                        </DialogDescription>
                    </DialogHeader>

                    {success ? (
                        <div className="mt-6 text-center py-8">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'oklch(0.65 0.22 45)' }} />
                            <h3 className="font-orbitron text-lg mb-2" style={{ color: 'oklch(0.65 0.22 45)' }}>Registration Submitted!</h3>
                            <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.60 0.02 60)' }}>
                                Your registration is pending admin approval. Room ID and Password will be visible on your dashboard once approved.
                            </p>
                            <Button onClick={handleClose} className="mt-6 font-saira tracking-wider uppercase" style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}>
                                Close
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-5">
                            {/* UPI Info */}
                            <div className="p-3 rounded" style={{ background: 'oklch(0.15 0.01 50)', border: '1px solid oklch(0.25 0.03 50)' }}>
                                <p className="font-saira text-xs tracking-widest uppercase mb-1" style={{ color: 'oklch(0.55 0.02 60)' }}>UPI ID</p>
                                <p className="font-orbitron text-sm font-bold" style={{ color: 'oklch(0.75 0.18 85)' }}>{upiId}</p>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center">
                                <div className="p-2 rounded" style={{ background: 'oklch(0.15 0.01 50)', border: '1px solid oklch(0.25 0.03 50)' }}>
                                    <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48 object-contain" />
                                </div>
                            </div>

                            {/* Entry Fee */}
                            <div className="flex justify-between items-center p-3 rounded" style={{ background: 'oklch(0.15 0.01 50)', border: '1px solid oklch(0.25 0.03 50)' }}>
                                <span className="font-saira text-xs tracking-widest uppercase" style={{ color: 'oklch(0.55 0.02 60)' }}>Entry Fee</span>
                                <span className="font-orbitron font-bold" style={{ color: 'oklch(0.65 0.22 45)' }}>₹{tournament.entryFee.toString()}</span>
                            </div>

                            {/* Screenshot Upload */}
                            <div>
                                <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>
                                    Payment Screenshot *
                                </Label>
                                <div
                                    className="border-2 border-dashed rounded p-4 text-center cursor-pointer transition-colors"
                                    style={{ borderColor: screenshotFile ? 'oklch(0.65 0.22 45)' : 'oklch(0.30 0.02 50)', background: 'oklch(0.13 0 0)' }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {screenshotPreview ? (
                                        <img src={screenshotPreview} alt="Screenshot preview" className="max-h-32 mx-auto rounded object-contain" />
                                    ) : (
                                        <div>
                                            <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'oklch(0.45 0.02 60)' }} />
                                            <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.55 0.02 60)' }}>Click to upload screenshot</p>
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </div>
                            </div>

                            {/* T&C */}
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="payment-terms"
                                    checked={agreedToTerms}
                                    onCheckedChange={(v) => setAgreedToTerms(!!v)}
                                    className="mt-0.5"
                                    style={{ borderColor: 'oklch(0.65 0.22 45)' }}
                                />
                                <Label htmlFor="payment-terms" className="font-rajdhani text-sm cursor-pointer" style={{ color: 'oklch(0.65 0.02 60)' }}>
                                    I agree to the{' '}
                                    <Link to="/terms" className="underline" style={{ color: 'oklch(0.65 0.22 45)' }} onClick={handleClose}>
                                        Terms & Conditions
                                    </Link>
                                </Label>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded" style={{ background: 'oklch(0.20 0.08 25)', border: '1px solid oklch(0.55 0.22 25)' }}>
                                    <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.70 0.22 25)' }} />
                                    <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.80 0.10 25)' }}>{error}</p>
                                </div>
                            )}

                            <Button
                                onClick={handleSubmit}
                                disabled={!agreedToTerms || !screenshotFile || registerMutation.isPending}
                                className="w-full font-saira tracking-wider uppercase font-bold"
                                style={{ background: agreedToTerms && screenshotFile ? 'oklch(0.65 0.22 45)' : 'oklch(0.25 0.02 50)', color: 'oklch(0.08 0 0)' }}
                            >
                                {registerMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                                ) : (
                                    'Submit Registration'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
