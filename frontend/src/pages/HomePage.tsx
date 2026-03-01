import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Trophy, Shield, Zap, Users } from 'lucide-react';

export default function HomePage() {
    return (
        <div style={{ background: 'oklch(0.10 0 0)' }}>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4">
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse at 50% 0%, oklch(0.65 0.22 45 / 0.15) 0%, transparent 70%)'
                }} />
                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-block mb-4 px-4 py-1 rounded-sm font-saira text-xs tracking-widest uppercase" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)', color: 'oklch(0.65 0.22 45)' }}>
                        ⚔ India's Premier BGMI Tournament Platform
                    </div>
                    <h1 className="font-orbitron text-4xl md:text-6xl font-black mb-6 leading-tight">
                        <span className="text-gradient-orange">RAJ EMPIRE</span>
                        <br />
                        <span style={{ color: 'oklch(0.90 0.01 80)' }}>ESPORTS</span>
                    </h1>
                    <p className="font-rajdhani text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'oklch(0.60 0.02 60)' }}>
                        Compete in elite BGMI tournaments. Register, pay, and battle for glory. Room details unlocked after admin approval.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/tournaments">
                            <Button size="lg" className="font-saira tracking-widest uppercase font-bold px-8 clip-angular" style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}>
                                <Trophy className="w-5 h-5 mr-2" />
                                View Tournaments
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button size="lg" variant="outline" className="font-saira tracking-widest uppercase font-bold px-8" style={{ borderColor: 'oklch(0.65 0.22 45)', color: 'oklch(0.65 0.22 45)' }}>
                                Join Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <h2 className="font-orbitron text-2xl font-bold text-center mb-12" style={{ color: 'oklch(0.75 0.18 85)' }}>
                        WHY RAJ EMPIRE?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Trophy, title: 'Big Prize Pools', desc: 'Compete for massive cash prizes in every tournament.' },
                            { icon: Shield, title: 'Secure Payments', desc: 'UPI-based payments with admin verification for safety.' },
                            { icon: Zap, title: 'Instant Updates', desc: 'Get Room ID & Password instantly after approval.' },
                            { icon: Users, title: 'Active Community', desc: 'Join thousands of BGMI players across India.' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="p-6 clip-angular-sm" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                                <div className="w-12 h-12 flex items-center justify-center mb-4 rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)' }}>
                                    <Icon className="w-6 h-6" style={{ color: 'oklch(0.65 0.22 45)' }} />
                                </div>
                                <h3 className="font-orbitron text-sm font-bold mb-2" style={{ color: 'oklch(0.90 0.01 80)' }}>{title}</h3>
                                <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.55 0.02 60)' }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <div className="text-center p-12 clip-angular" style={{ background: 'linear-gradient(135deg, oklch(0.13 0 0), oklch(0.15 0.01 50))', border: '1px solid oklch(0.65 0.22 45 / 0.3)' }}>
                        <h2 className="font-orbitron text-3xl font-black mb-4" style={{ color: 'oklch(0.90 0.01 80)' }}>
                            READY TO DOMINATE?
                        </h2>
                        <p className="font-rajdhani text-lg mb-8" style={{ color: 'oklch(0.60 0.02 60)' }}>
                            Register now and start your journey to the top.
                        </p>
                        <Link to="/register">
                            <Button size="lg" className="font-saira tracking-widest uppercase font-bold px-10 clip-angular" style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 45), oklch(0.75 0.18 85))', color: 'oklch(0.08 0 0)' }}>
                                Create Account
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
