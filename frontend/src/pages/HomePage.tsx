import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Trophy, Users, Zap, Shield, ChevronRight, Gamepad2, Star, Target, User } from 'lucide-react';
import { useGetAllTournaments } from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: tournaments } = useGetAllTournaments();

  const upcomingCount = tournaments?.filter(t => t.status === 'upcoming' || t.status === 'ongoing').length ?? 0;

  const features = [
    {
      icon: <Trophy size={28} />,
      title: 'Epic Tournaments',
      desc: 'Join daily BGMI tournaments with massive prize pools and compete against the best.',
    },
    {
      icon: <Zap size={28} />,
      title: 'Instant Registration',
      desc: 'Register in seconds with our streamlined payment and verification system.',
    },
    {
      icon: <Users size={28} />,
      title: 'Growing Community',
      desc: 'Be part of a thriving esports community of passionate BGMI players.',
    },
    {
      icon: <Target size={28} />,
      title: 'Fair Play',
      desc: 'Transparent rules, verified payments, and fair match-making for all players.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <Star size={14} className="text-white fill-white" />
              <span className="text-white text-sm font-medium">India's Premier BGMI Tournament Platform</span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Raj Empire
              <br />
              <span className="text-white/80">Esports Arena</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              Compete in thrilling BGMI tournaments, win real prizes, and prove you're the best player in the arena.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate({ to: '/' })}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-red rounded-xl font-bold text-lg hover:bg-white/90 transition-all shadow-brand-lg"
              >
                <Trophy size={20} />
                View Tournaments
                <ChevronRight size={18} />
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate({ to: '/player' })}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-lg transition-all border border-white/30"
                >
                  <Gamepad2 size={20} />
                  Join Now — Free
                </button>
              )}
            </div>
            {upcomingCount > 0 && (
              <p className="mt-6 text-white/70 text-sm">
                🔥 {upcomingCount} tournament{upcomingCount > 1 ? 's' : ''} available right now!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Panel Links Section */}
      <section className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Quick Access</h2>
            <p className="text-muted-foreground">Jump directly to your panel</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* User Panel */}
            <button
              onClick={() => navigate({ to: '/player' })}
              className="group relative overflow-hidden rounded-2xl p-6 bg-brand-gradient shadow-brand hover:shadow-brand-lg transition-all duration-300 hover:-translate-y-1 text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                  <User size={28} className="text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white mb-1">User Panel</h3>
                <p className="text-white/75 text-sm mb-4">
                  Access your dashboard, registrations, and support tickets.
                </p>
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  Open Panel <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* Admin Panel */}
            <button
              onClick={() => navigate({ to: '/admin' })}
              className="group relative overflow-hidden rounded-2xl p-6 shadow-brand hover:shadow-brand-lg transition-all duration-300 hover:-translate-y-1 text-left border border-white/10"
              style={{ background: 'linear-gradient(135deg, oklch(0.42 0.24 18), oklch(0.52 0.24 22))' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                  <Shield size={28} className="text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white mb-1">Admin Panel</h3>
                <p className="text-white/75 text-sm mb-4">
                  Manage tournaments, registrations, players, and settings.
                </p>
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  Open Panel <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-muted-foreground text-xs">
              User Panel: <code className="bg-muted px-2 py-0.5 rounded text-xs">/player</code>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              Admin Panel: <code className="bg-muted px-2 py-0.5 rounded text-xs">/admin</code>
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Tournaments', value: tournaments?.length ?? 0, suffix: '+' },
              { label: 'Active Players', value: 500, suffix: '+' },
              { label: 'Prize Distributed', value: '₹50K', suffix: '+' },
              { label: 'Daily Matches', value: 10, suffix: '+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-muted/50 border border-border">
                <div
                  className="font-heading text-3xl md:text-4xl font-bold mb-1"
                  style={{ background: 'linear-gradient(135deg, oklch(0.48 0.24 22), oklch(0.65 0.22 52))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Raj Empire?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We provide the best BGMI tournament experience with fair play and real rewards.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-brand-orange/50 hover:shadow-brand transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-gradient flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Dominate the Arena?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of players competing in daily BGMI tournaments. Register now and start winning!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate({ to: isAuthenticated ? '/player/dashboard' : '/player' })}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-red rounded-xl font-bold text-lg hover:bg-white/90 transition-all shadow-brand-lg"
            >
              <Trophy size={20} />
              {isAuthenticated ? 'Go to Dashboard' : 'Register Free'}
            </button>
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-lg transition-all border border-white/30"
            >
              View All Tournaments
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
