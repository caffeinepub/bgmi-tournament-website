import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Heart, Youtube, Instagram, Send, Gamepad2 } from 'lucide-react';
import { useGetSocialLinks } from '../hooks/useQueries';

export default function Footer() {
  const navigate = useNavigate();
  const { data: socialLinks } = useGetSocialLinks();
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'raj-empire-esports');

  return (
    <footer className="bg-brand-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Gamepad2 size={22} className="text-white" />
              </div>
              <div>
                <span className="font-heading font-bold text-lg block">Raj Empire</span>
                <span className="text-white/70 text-xs uppercase tracking-wider">Esports</span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Your ultimate destination for BGMI tournaments. Compete, win, and rise to the top!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate({ to: '/' })} className="text-white/70 hover:text-white text-sm transition-colors hover:underline">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ to: '/player/dashboard' })} className="text-white/70 hover:text-white text-sm transition-colors hover:underline">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ to: '/terms' })} className="text-white/70 hover:text-white text-sm transition-colors hover:underline">
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ to: '/admin' })} className="text-white/70 hover:text-white text-sm transition-colors hover:underline">
                  Admin Panel
                </button>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4 text-white">Follow Us</h3>
            <div className="flex gap-3">
              {socialLinks?.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <Youtube size={18} className="text-white" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <Instagram size={18} className="text-white" />
                </a>
              )}
              {socialLinks?.telegram && (
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <Send size={18} className="text-white" />
                </a>
              )}
              {!socialLinks?.youtube && !socialLinks?.instagram && !socialLinks?.telegram && (
                <p className="text-white/50 text-sm">Social links coming soon</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/60 text-sm">
            © {year} Raj Empire Esports. All rights reserved.
          </p>
          <p className="text-white/60 text-sm flex items-center gap-1">
            Built with <Heart size={14} className="text-white fill-white" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 font-semibold underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
