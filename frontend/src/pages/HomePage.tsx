import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Trophy, Gamepad2, Users, Zap, Shield, Star } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Daily Tournaments',
      desc: 'Compete every day in exciting BGMI tournaments with real cash prizes.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Mega Events',
      desc: 'Join massive tournaments with huge prize pools and epic competition.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Solo / Duo / Squad',
      desc: 'Play your way — solo, with a partner, or as a full squad of four.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Fair & Secure',
      desc: 'Transparent registration, verified payments, and fair match rules.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative min-h-[560px] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #C0100A 0%, #E03010 40%, #FF6A00 100%)',
        }}
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/assets/generated/hero-bg.dim_1440x600.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-6">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-white text-sm font-medium">India's Premier BGMI Tournament Platform</span>
          </div>

          {/* Heading */}
          <h1 className="font-orbitron font-black text-white text-4xl sm:text-5xl md:text-6xl leading-tight mb-4">
            Raj Empire
            <br />
            <span className="text-white/90">Esports Arena</span>
          </h1>

          {/* Tagline */}
          <p className="text-white/85 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Compete in thrilling BGMI tournaments, win real prizes, and prove you're the best player in the arena.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate({ to: '/tournaments' })}
              className="flex items-center justify-center gap-2 bg-white text-brand-red font-bold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all shadow-lg text-base"
            >
              <Trophy className="w-5 h-5" />
              View Tournaments
              <span className="text-brand-red/60">›</span>
            </button>
            <button
              onClick={() => navigate({ to: '/player/register' })}
              className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm border border-white/40 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/30 transition-all text-base"
            >
              <Gamepad2 className="w-5 h-5" />
              Join Now — Free
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 bg-brand-darker">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-orbitron font-bold text-white text-2xl sm:text-3xl mb-3">
              Why Choose <span className="text-brand-orange">Raj Empire?</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              The most trusted BGMI tournament platform in India with daily competitions and massive prize pools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-brand-dark border border-brand-red/20 rounded-xl p-5 hover:border-brand-red/50 transition-all group"
              >
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-brand-red/20 to-brand-orange/20 flex items-center justify-center text-brand-orange mb-4 group-hover:from-brand-red/30 group-hover:to-brand-orange/30 transition-all">
                  {f.icon}
                </div>
                <h3 className="font-orbitron font-bold text-white text-sm mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14 px-4 sm:px-6 bg-brand-dark">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-orbitron font-bold text-white text-2xl sm:text-3xl mb-4">
            Ready to <span className="text-brand-orange">Dominate?</span>
          </h2>
          <p className="text-gray-400 mb-7">
            Register now and start competing in daily BGMI tournaments. It's free to join!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate({ to: '/player/register' })}
              className="px-8 py-3.5 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-red/30 text-base"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate({ to: '/tournaments' })}
              className="px-8 py-3.5 border border-brand-red/40 text-brand-orange font-bold rounded-xl hover:bg-brand-red/10 transition-all text-base"
            >
              Browse Tournaments
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
