import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { useGenerateOtp, useVerifyOtp, useRegisterPlayer } from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';

type Step = 'mobile' | 'otp' | 'details';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [step, setStep] = useState<Step>('mobile');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bgmiPlayerId, setBgmiPlayerId] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const [showOtp, setShowOtp] = useState(false);

    const generateOtpMutation = useGenerateOtp();
    const verifyOtpMutation = useVerifyOtp();
    const registerPlayerMutation = useRegisterPlayer();

    const handleSendOtp = async () => {
        if (!mobile || mobile.length < 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        setError('');
        try {
            const code = await generateOtpMutation.mutateAsync();
            setGeneratedOtp(code);
            setStep('otp');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to generate OTP.';
            if (msg.includes('already exists') || msg.includes('Player already')) {
                setError('This mobile number is already registered. Please login instead.');
            } else {
                setError(msg);
            }
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 4) {
            setError('Please enter the 4-digit OTP.');
            return;
        }
        setError('');
        try {
            const valid = await verifyOtpMutation.mutateAsync(otp);
            if (valid) {
                setStep('details');
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (err: unknown) {
            setError('OTP verification failed. Please try again.');
        }
    };

    const handleRegister = async () => {
        if (!displayName.trim()) {
            setError('Please enter your display name.');
            return;
        }
        if (!bgmiPlayerId.trim()) {
            setError('Please enter your BGMI Player ID.');
            return;
        }
        if (!agreedToTerms) {
            setError('Please agree to the Terms & Conditions.');
            return;
        }
        setError('');
        try {
            await registerPlayerMutation.mutateAsync({ mobile, bgmiPlayerId: bgmiPlayerId.trim(), displayName: displayName.trim() });
            login({ mobile, displayName: displayName.trim(), bgmiPlayerId: bgmiPlayerId.trim() });
            navigate({ to: '/dashboard' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed.';
            if (msg.includes('already exists') || msg.includes('Player already')) {
                setError('An account with this mobile number already exists. Please login.');
            } else {
                setError(msg);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'oklch(0.10 0 0)' }}>
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-3 px-3 py-1 font-saira text-xs tracking-widest uppercase rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)', color: 'oklch(0.65 0.22 45)' }}>
                        Player Registration
                    </div>
                    <h1 className="font-orbitron text-2xl font-black" style={{ color: 'oklch(0.90 0.01 80)' }}>
                        JOIN THE EMPIRE
                    </h1>
                    <p className="font-rajdhani text-sm mt-2" style={{ color: 'oklch(0.55 0.02 60)' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="underline" style={{ color: 'oklch(0.65 0.22 45)' }}>Login here</Link>
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {(['mobile', 'otp', 'details'] as Step[]).map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-orbitron text-xs font-bold transition-all`}
                                style={{
                                    background: step === s ? 'oklch(0.65 0.22 45)' : ((['mobile', 'otp', 'details'].indexOf(step) > i) ? 'oklch(0.65 0.22 45 / 0.3)' : 'oklch(0.18 0 0)'),
                                    color: step === s ? 'oklch(0.08 0 0)' : 'oklch(0.55 0.02 60)',
                                    border: '1px solid oklch(0.65 0.22 45 / 0.4)'
                                }}>
                                {i + 1}
                            </div>
                            {i < 2 && <div className="w-8 h-px" style={{ background: 'oklch(0.25 0.02 50)' }} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Form Card */}
                <div className="p-6 clip-angular" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                    {/* Step 1: Mobile */}
                    {step === 'mobile' && (
                        <div className="space-y-4">
                            <div>
                                <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>
                                    Mobile Number
                                </Label>
                                <Input
                                    type="tel"
                                    placeholder="Enter 10-digit mobile number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="font-rajdhani"
                                    style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                                />
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-sm" style={{ background: 'oklch(0.18 0.08 25)', border: '1px solid oklch(0.45 0.22 25)' }}>
                                    <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.70 0.22 25)' }} />
                                    <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.80 0.10 25)' }}>{error}</p>
                                </div>
                            )}
                            <Button
                                onClick={handleSendOtp}
                                disabled={generateOtpMutation.isPending || mobile.length < 10}
                                className="w-full font-saira tracking-widest uppercase font-bold"
                                style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}
                            >
                                {generateOtpMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : 'Send OTP'}
                            </Button>
                        </div>
                    )}

                    {/* Step 2: OTP */}
                    {step === 'otp' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-sm text-center" style={{ background: 'oklch(0.65 0.22 45 / 0.1)', border: '1px solid oklch(0.65 0.22 45 / 0.3)' }}>
                                <p className="font-saira text-xs tracking-widest uppercase mb-1" style={{ color: 'oklch(0.55 0.02 60)' }}>Your OTP Code</p>
                                <div className="flex items-center justify-center gap-2">
                                    <p className="font-orbitron text-3xl font-black" style={{ color: 'oklch(0.65 0.22 45)' }}>
                                        {showOtp ? generatedOtp : '••••'}
                                    </p>
                                    <button onClick={() => setShowOtp(!showOtp)} style={{ color: 'oklch(0.55 0.02 60)' }}>
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="font-rajdhani text-xs mt-1" style={{ color: 'oklch(0.45 0.02 60)' }}>
                                    (Simulated OTP — use this code)
                                </p>
                            </div>
                            <div>
                                <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>
                                    Enter OTP
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="4-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="font-orbitron text-center text-xl tracking-widest"
                                    style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                                />
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-sm" style={{ background: 'oklch(0.18 0.08 25)', border: '1px solid oklch(0.45 0.22 25)' }}>
                                    <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.70 0.22 25)' }} />
                                    <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.80 0.10 25)' }}>{error}</p>
                                </div>
                            )}
                            <Button
                                onClick={handleVerifyOtp}
                                disabled={verifyOtpMutation.isPending || otp.length !== 4}
                                className="w-full font-saira tracking-widest uppercase font-bold"
                                style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}
                            >
                                {verifyOtpMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : 'Verify OTP'}
                            </Button>
                            <button onClick={() => { setStep('mobile'); setOtp(''); setError(''); }} className="w-full font-saira text-xs tracking-wider uppercase" style={{ color: 'oklch(0.50 0.02 60)' }}>
                                ← Change Mobile Number
                            </button>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {step === 'details' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.1)', border: '1px solid oklch(0.65 0.22 45 / 0.3)' }}>
                                <CheckCircle className="w-4 h-4" style={{ color: 'oklch(0.65 0.22 45)' }} />
                                <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.65 0.22 45)' }}>Mobile verified: {mobile}</p>
                            </div>
                            <div>
                                <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>
                                    Display Name
                                </Label>
                                <Input
                                    placeholder="Your in-game name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="font-rajdhani"
                                    style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                                />
                            </div>
                            <div>
                                <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>
                                    BGMI Player ID *
                                </Label>
                                <Input
                                    placeholder="Your BGMI Player ID"
                                    value={bgmiPlayerId}
                                    onChange={(e) => setBgmiPlayerId(e.target.value)}
                                    className="font-rajdhani"
                                    style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                                />
                            </div>
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="reg-terms"
                                    checked={agreedToTerms}
                                    onCheckedChange={(v) => setAgreedToTerms(!!v)}
                                    className="mt-0.5"
                                    style={{ borderColor: 'oklch(0.65 0.22 45)' }}
                                />
                                <Label htmlFor="reg-terms" className="font-rajdhani text-sm cursor-pointer" style={{ color: 'oklch(0.65 0.02 60)' }}>
                                    I agree to the{' '}
                                    <Link to="/terms" target="_blank" className="underline" style={{ color: 'oklch(0.65 0.22 45)' }}>
                                        Terms & Conditions
                                    </Link>
                                </Label>
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-sm" style={{ background: 'oklch(0.18 0.08 25)', border: '1px solid oklch(0.45 0.22 25)' }}>
                                    <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.70 0.22 25)' }} />
                                    <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.80 0.10 25)' }}>{error}</p>
                                </div>
                            )}
                            <Button
                                onClick={handleRegister}
                                disabled={!agreedToTerms || !displayName.trim() || !bgmiPlayerId.trim() || registerPlayerMutation.isPending}
                                className="w-full font-saira tracking-widest uppercase font-bold"
                                style={{ background: agreedToTerms ? 'oklch(0.65 0.22 45)' : 'oklch(0.25 0.02 50)', color: 'oklch(0.08 0 0)' }}
                            >
                                {registerPlayerMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...</> : 'Create Account'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
