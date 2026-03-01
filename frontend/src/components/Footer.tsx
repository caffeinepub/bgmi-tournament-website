import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetSocialLinks } from '../hooks/useQueries';
import { SiYoutube, SiInstagram, SiTelegram } from 'react-icons/si';
import { Heart } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const { data: socialLinks } = useGetSocialLinks();
  const appId = typeof window !== 'undefined' ? encodeURIComponent(window.location.hostname) : 'unknown-app';

  return (
    <footer style={{ background: 'oklch(0.08 0 0)', borderTop: '1px solid oklch(0.65 0.22 45 / 0.3)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <img
              src="/assets/generated/raj-empire-esports-logo.dim_400x120.png"
              alt="Raj Empire Esports"
              className="h-8 w-auto object-contain"
            />
            <p className="font-saira text-xs tracking-widest uppercase" style={{ color: 'oklch(0.45 0.02 60)' }}>
              Battle Royale Tournament Platform
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate({ to: '/' })}
              className="font-saira text-xs tracking-widest uppercase transition-colors"
              style={{ color: 'oklch(0.55 0.02 60)' }}
            >
              Tournaments
            </button>
            <button
              onClick={() => navigate({ to: '/terms' })}
              className="font-saira text-xs tracking-widest uppercase transition-colors"
              style={{ color: 'oklch(0.55 0.02 60)' }}
            >
              Terms
            </button>
            <button
              onClick={() => navigate({ to: '/player/login' })}
              className="font-saira text-xs tracking-widest uppercase transition-colors"
              style={{ color: 'oklch(0.55 0.02 60)' }}
            >
              Login
            </button>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks?.youtube && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-red-500"
                style={{ color: 'oklch(0.55 0.02 60)' }}
                aria-label="YouTube"
              >
                <SiYoutube className="w-5 h-5" />
              </a>
            )}
            {socialLinks?.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: 'oklch(0.55 0.02 60)' }}
                aria-label="Instagram"
              >
                <SiInstagram className="w-5 h-5" />
              </a>
            )}
            {socialLinks?.telegram && (
              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-blue-400"
                style={{ color: 'oklch(0.55 0.02 60)' }}
                aria-label="Telegram"
              >
                <SiTelegram className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-2" style={{ borderTop: '1px solid oklch(0.20 0 0)' }}>
          <p className="font-rajdhani text-xs" style={{ color: 'oklch(0.40 0.02 60)' }}>
            © {new Date().getFullYear()} Raj Empire Esports. All rights reserved.
          </p>
          <p className="font-rajdhani text-xs flex items-center gap-1" style={{ color: 'oklch(0.40 0.02 60)' }}>
            Built with <Heart className="w-3 h-3 inline" style={{ color: 'oklch(0.65 0.22 45)' }} /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'oklch(0.65 0.22 45)' }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
