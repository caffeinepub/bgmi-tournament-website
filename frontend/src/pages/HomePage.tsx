import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Trophy, Shield, Zap, Users, Star, ChevronRight } from 'lucide-react';
import { SiYoutube, SiInstagram, SiTelegram } from 'react-icons/si';
import { useGetSocialLinks } from '../hooks/useQueries';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: socialLinks } = useGetSocialLinks();

  const features = [
    { icon: Trophy, title: 'Big Prize Pools', desc: 'Compete for massive cash prizes in every tournament.' },
    { icon: Shield, title: 'Secure Payments', desc: 'UPI-based payments with admin verification for safety.' },
    { icon: Zap, title: 'Fast Room Details', desc: 'Get Room ID & Password instantly after approval.' },
    { icon: Users, title: 'Elite Community', desc: 'Join thousands of BGMI players across India.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src="/assets/generated/raj-empire-esports-logo.dim_400x120.png" alt="Raj Empire Esports" className="h-12 object-contain" />
          <nav className="flex items-center gap-6">
            <button onClick={() => navigate({ to: '/' })} className="font-rajdhani font-semibold text-muted-foreground hover:text-primary transition-colors tracking-widest text-sm uppercase">
              Tournaments
            </button>
            <button onClick={() => navigate({ to: '/player/login' })} className="font-rajdhani font-semibold text-muted-foreground hover:text-primary transition-colors tracking-widest text-sm uppercase">
              Login
            </button>
            <button
              onClick={() => navigate({ to: '/player' })}
              className="bg-primary text-primary-foreground font-rajdhani font-bold px-5 py-2 rounded border border-primary hover:bg-primary/90 transition-colors tracking-widest text-sm uppercase"
            >
              Register
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 border border-primary/50 text-primary font-rajdhani text-xs tracking-widest uppercase px-4 py-1.5 mb-8">
              <Star className="w-3 h-3" />
              India's Premier BGMI Tournament Platform
            </div>
            <h1 className="font-orbitron font-black text-5xl md:text-7xl text-primary leading-tight mb-4">
              RAJ EMPIRE
            </h1>
            <h1 className="font-orbitron font-black text-5xl md:text-7xl text-foreground leading-tight mb-8">
              ESPORTS
            </h1>
            <p className="font-rajdhani text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Compete in elite BGMI tournaments. Register, pay, and battle for glory. Room details unlocked after admin approval.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate({ to: '/player' })}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-rajdhani font-bold px-8 py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                View Tournaments
              </button>
              <button
                onClick={() => navigate({ to: '/player' })}
                className="flex items-center justify-center gap-2 border border-foreground text-foreground font-rajdhani font-bold px-8 py-3 uppercase tracking-widest hover:bg-foreground/10 transition-colors"
              >
                Join Now
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-card/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-orbitron font-bold text-3xl text-primary text-center mb-12 uppercase tracking-widest">
              Why Raj Empire?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card border border-border p-6 hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 bg-primary/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-rajdhani font-bold text-foreground text-lg mb-2">{title}</h3>
                  <p className="font-saira text-muted-foreground text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-orbitron font-bold text-3xl text-foreground mb-4 uppercase tracking-widest">
              Ready to Compete?
            </h2>
            <p className="font-rajdhani text-muted-foreground mb-8">
              Register now and join India's most competitive BGMI tournament platform.
            </p>
            <button
              onClick={() => navigate({ to: '/player' })}
              className="bg-primary text-primary-foreground font-rajdhani font-bold px-10 py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors text-lg"
            >
              Register Now
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src="/assets/generated/raj-empire-esports-logo.dim_400x120.png" alt="Raj Empire Esports" className="h-10 object-contain" />
            <div className="flex items-center gap-4">
              {socialLinks?.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiYoutube className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiInstagram className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.telegram && (
                <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiTelegram className="w-5 h-5" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs font-saira text-muted-foreground">
              <button onClick={() => navigate({ to: '/terms' })} className="hover:text-primary transition-colors">Terms & Conditions</button>
              <button onClick={() => navigate({ to: '/admin' })} className="hover:text-primary transition-colors">Admin</button>
            </div>
          </div>
          <div className="mt-6 text-center text-xs font-saira text-muted-foreground">
            <p>© {new Date().getFullYear()} Raj Empire Esports. All rights reserved.</p>
            <p className="mt-1">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
