import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetSocialLinks } from '../hooks/useQueries';
import { Gamepad2, Heart } from 'lucide-react';
import { SiYoutube, SiInstagram, SiTelegram } from 'react-icons/si';

export default function Footer() {
  const navigate = useNavigate();
  const { data: socialLinks } = useGetSocialLinks();
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'raj-empire-esports');

  return (
    <footer className="bg-brand-dark border-t border-brand-red/20 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-red to-brand-orange flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-orbitron font-bold text-white text-sm block">RAJ EMPIRE</span>
                <span className="font-orbitron text-brand-orange text-xs block">ESPORTS ARENA</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              India's Premier BGMI Tournament Platform. Compete, win, and prove you're the best.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Tournaments', to: '/tournaments' },
                { label: 'Register', to: '/player/register' },
                { label: 'Login', to: '/player/login' },
                { label: 'Terms & Conditions', to: '/terms' },
              ].map((link) => (
                <li key={link.to}>
                  <button
                    onClick={() => navigate({ to: link.to })}
                    className="text-sm text-gray-500 hover:text-brand-orange transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Follow Us</h3>
            <div className="flex gap-3">
              {socialLinks?.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-red-600/20 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                >
                  <SiYoutube className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-pink-600/20 flex items-center justify-center text-gray-400 hover:text-pink-500 transition-all"
                >
                  <SiInstagram className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.telegram && (
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-blue-600/20 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all"
                >
                  <SiTelegram className="w-4 h-4" />
                </a>
              )}
              {!socialLinks?.youtube && !socialLinks?.instagram && !socialLinks?.telegram && (
                <p className="text-xs text-gray-600">Social links coming soon</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© {year} Raj Empire Esports Arena. All rights reserved.</p>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-brand-red fill-brand-red" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-orange hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
