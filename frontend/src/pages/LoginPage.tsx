import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Eye } from 'lucide-react';
import { useGenerateOtp, useVerifyOtp } from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';

type Step = 'mobile' | 'otp';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [step, setStep] = useState<Step>('mobile');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [error, setError] = useState('');
    const [showOtp, setShowOtp] = useState(false);

    const generateOtpMutation = useGenerateOtp();
    const verifyOtpMutation = useVerifyOtp();

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
            setError('Failed to generate OTP. Please try again.');
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
                // Login with mobile — display name and bgmiPlayerId will be fetched from backend
                // For now, store mobile and use placeholder values
                login({ mobile, displayName: mobile, bgmiPlayerId: '' });
                navigate({ to: '/dashboard' });
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (err: unknown) {
            setError('OTP verification failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'oklch(0.10 0 0)' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block mb-3 px-3 py-1 font-saira text-xs tracking-widest uppercase rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)', color: 'oklch(0.65 0.22 45)' }}>
                        Player Login
                    </div>
                    <h1 className="font-orbitron text-2xl font-black" style={{ color: 'oklch(0.90 0.01 80)' }}>
                        ENTER THE ARENA
                    </h1>
                    <p className="font-rajdhani text-sm mt-2" style={{ color: 'oklch(0.55 0.02 60)' }}>
                        New player?{' '}
                        <Link to="/register" className="underline" style={{ color: 'oklch(0.65 0.22 45)' }}>Register here</Link>
                    </p>
                </div>

                <div className="p-6 clip-angular" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
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
                                {verifyOtpMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : 'Login'}
                            </Button>
                            <button onClick={() => { setStep('mobile'); setOtp(''); setError(''); }} className="w-full font-saira text-xs tracking-wider uppercase" style={{ color: 'oklch(0.50 0.02 60)' }}>
                                ← Change Mobile Number
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
