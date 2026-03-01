import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const { adminLogin, isAdminLoggedIn } = useAdminAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect
    React.useEffect(() => {
        if (isAdminLoggedIn) {
            navigate({ to: '/admin/dashboard' });
        }
    }, [isAdminLoggedIn, navigate]);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setError('Please enter username and password.');
            return;
        }
        setLoading(true);
        setError('');
        // Small delay for UX
        await new Promise(r => setTimeout(r, 300));
        const success = adminLogin(username, password);
        setLoading(false);
        if (success) {
            navigate({ to: '/admin/dashboard' });
        } else {
            setError('Invalid credentials. Access denied.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'oklch(0.08 0 0)' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                        <Shield className="w-8 h-8" style={{ color: 'oklch(0.65 0.22 45)' }} />
                    </div>
                    <div className="inline-block mb-3 px-3 py-1 font-saira text-xs tracking-widest uppercase rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)', color: 'oklch(0.65 0.22 45)' }}>
                        Admin Access
                    </div>
                    <h1 className="font-orbitron text-2xl font-black" style={{ color: 'oklch(0.90 0.01 80)' }}>
                        COMMAND CENTER
                    </h1>
                    <p className="font-rajdhani text-sm mt-2" style={{ color: 'oklch(0.45 0.02 60)' }}>
                        Raj Empire Esports — Admin Panel
                    </p>
                </div>

                <div className="p-6 clip-angular" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                    <div className="space-y-4">
                        <div>
                            <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>
                                Username
                            </Label>
                            <Input
                                placeholder="Admin username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="font-rajdhani"
                                style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        <div>
                            <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>
                                Password
                            </Label>
                            <Input
                                type="password"
                                placeholder="Admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="font-rajdhani"
                                style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-sm" style={{ background: 'oklch(0.18 0.08 25)', border: '1px solid oklch(0.45 0.22 25)' }}>
                                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.70 0.22 25)' }} />
                                <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.80 0.10 25)' }}>{error}</p>
                            </div>
                        )}
                        <Button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full font-saira tracking-widest uppercase font-bold"
                            style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}
                        >
                            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating...</> : 'Access Admin Panel'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
